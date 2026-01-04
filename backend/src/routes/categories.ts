import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const addFavoriteCategorySchema = z.object({
  category: z.string().min(1, 'Category name is required'),
  emoji: z.string().min(1, 'Emoji is required'),
  type: z.enum(['EXPENSE', 'INCOME']),
  order: z.number().int().optional(),
});

const updateFavoriteCategorySchema = z.object({
  emoji: z.string().optional(),
  order: z.number().int().optional(),
});

// Get favorite categories
router.get('/favorites', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { type } = req.query;

    const favorites = await prisma.favoriteCategory.findMany({
      where: {
        userId: req.userId,
        ...(type && { type: type as 'EXPENSE' | 'INCOME' }),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    res.json({
      status: 'success',
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
});

// Add favorite category
router.post('/favorites', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = addFavoriteCategorySchema.parse(req.body);

    // Check total category limit (30 categories per type)
    const totalCategories = await prisma.favoriteCategory.count({
      where: {
        userId: req.userId!,
        type: data.type,
      },
    });

    if (totalCategories >= 30) {
      throw new AppError(400, 'You have reached the maximum limit of 30 categories. Please delete some categories to add new ones.');
    }

    // Check if already exists
    const existing = await prisma.favoriteCategory.findUnique({
      where: {
        userId_category_type: {
          userId: req.userId!,
          category: data.category,
          type: data.type,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'This category is already in your favorites');
    }

    // If no order specified, add to end
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.favoriteCategory.findFirst({
        where: { userId: req.userId, type: data.type },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = maxOrder ? maxOrder.order + 1 : 0;
    }

    const favorite = await prisma.favoriteCategory.create({
      data: {
        userId: req.userId!,
        category: data.category,
        emoji: data.emoji,
        type: data.type,
        order,
      },
    });

    res.status(201).json({
      status: 'success',
      data: favorite,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Update favorite category
router.patch('/favorites/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = updateFavoriteCategorySchema.parse(req.body);

    // Check ownership
    const existing = await prisma.favoriteCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'Favorite category not found');
    }

    if (existing.userId !== req.userId) {
      throw new AppError(403, 'Not authorized to update this favorite');
    }

    const favorite = await prisma.favoriteCategory.update({
      where: { id },
      data,
    });

    res.json({
      status: 'success',
      data: favorite,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Delete favorite category
router.delete('/favorites/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.favoriteCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'Favorite category not found');
    }

    if (existing.userId !== req.userId) {
      throw new AppError(403, 'Not authorized to delete this favorite');
    }

    await prisma.favoriteCategory.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Favorite category removed',
    });
  } catch (error) {
    next(error);
  }
});

// Get all unique categories (from user's transactions)
router.get('/all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { type } = req.query;

    const categories = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: {
        userId: req.userId,
        ...(type && { type: type as 'EXPENSE' | 'INCOME' }),
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    res.json({
      status: 'success',
      data: categories.map(c => ({
        category: c.category,
        type: c.type,
        count: c._count.id,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export { router as categoriesRouter };
