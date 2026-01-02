import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// Validation schemas
const quickEntrySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
});

const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

// ⚡ SUPER FAST: Quick entry endpoint (defaults to EXPENSE)
router.post('/quick', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount, category, type } = quickEntrySchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount: new Prisma.Decimal(amount),
        type: type || 'EXPENSE', // Defaults to EXPENSE if not specified
        category,
        source: 'MANUAL',
        date: new Date(),
      },
    });

    res.status(201).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Full transaction creation (with type selection)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        category: data.category,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        source: 'MANUAL',
      },
    });

    res.status(201).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Get user transactions with filters
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      startDate,
      endDate,
      category,
      type,
      limit = '50'
    } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        ...(startDate && endDate ? {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          }
        } : {}),
        ...(category ? { category: category as string } : {}),
        ...(type ? { type: type as 'EXPENSE' | 'INCOME' } : {}),
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      status: 'success',
      data: { transactions, count: transactions.length }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's most used categories (for quick entry suggestions)
router.get('/categories/suggestions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categories = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId: req.userId!,
        type: 'EXPENSE', // Only expense categories for quick entry
      },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6, // Top 6 for quick entry screen
    });

    const suggestions = categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
    }));

    res.json({
      status: 'success',
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    res.json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = createTransactionSchema.partial().parse(req.body);

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      throw new AppError(404, 'Transaction not found');
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(updates.amount && { amount: new Prisma.Decimal(updates.amount) }),
        ...(updates.type && { type: updates.type }),
        ...(updates.category && { category: updates.category }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.date && { date: new Date(updates.date) }),
      },
    });

    res.json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    await prisma.transaction.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as transactionRouter };
