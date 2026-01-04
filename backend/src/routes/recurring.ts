import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createRecurringSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  interval: z.number().int().positive().default(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

const updateRecurringSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  interval: z.number().int().positive().optional(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Calculate next run date based on frequency
function calculateNextRun(lastRun: Date, frequency: string, interval: number): Date {
  const next = new Date(lastRun);

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + interval);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + (interval * 7));
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next;
}

// Get all recurring transactions
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { recurring },
    });
  } catch (error) {
    next(error);
  }
});

// Create recurring transaction
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createRecurringSchema.parse(req.body);
    const startDate = new Date(data.startDate);
    const endDate = data.endDate ? new Date(data.endDate) : null;

    // Validate end date is after start date
    if (endDate && endDate <= startDate) {
      throw new AppError(400, 'End date must be after start date');
    }

    const nextRun = calculateNextRun(startDate, data.frequency, data.interval);

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId: req.userId!,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
        frequency: data.frequency,
        interval: data.interval,
        startDate,
        endDate,
        nextRun,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { recurring },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Update recurring transaction
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = updateRecurringSchema.parse(req.body);

    // Check ownership
    const existing = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'Recurring transaction not found');
    }

    if (existing.userId !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    // If frequency or interval changed, recalculate nextRun
    let nextRun = existing.nextRun;
    if (data.frequency || data.interval !== undefined) {
      const freq = data.frequency || existing.frequency;
      const interval = data.interval ?? existing.interval;
      nextRun = calculateNextRun(new Date(), freq, interval);
    }

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...data,
        nextRun,
        endDate: data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.json({
      status: 'success',
      data: { recurring: updated },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Delete recurring transaction
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'Recurring transaction not found');
    }

    if (existing.userId !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Recurring transaction deleted',
    });
  } catch (error) {
    next(error);
  }
});

// Process recurring transactions (run this periodically)
router.post('/process', async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();

    // Find all active recurring transactions that are due
    const dueRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId: req.userId,
        isActive: true,
        nextRun: {
          lte: now,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
    });

    const created = [];

    for (const recurring of dueRecurring) {
      // Create the actual transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: req.userId!,
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          description: recurring.description,
          date: now,
        },
      });

      created.push(transaction);

      // Calculate next run
      const nextRun = calculateNextRun(recurring.nextRun, recurring.frequency, recurring.interval);

      // Check if we should deactivate (past end date)
      const shouldDeactivate = recurring.endDate && nextRun > recurring.endDate;

      // Update recurring transaction
      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          nextRun,
          isActive: shouldDeactivate ? false : true,
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        processed: created.length,
        transactions: created,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as recurringRouter };
