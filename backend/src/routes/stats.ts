import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Get user statistics and budget
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Monthly calculations
    const [monthlyExpenses, monthlyIncome, categoryBreakdown] = await Promise.all([
      // Total expenses this month
      prisma.transaction.aggregate({
        where: {
          userId: req.userId!,
          type: 'EXPENSE',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Total income this month
      prisma.transaction.aggregate({
        where: {
          userId: req.userId!,
          type: 'INCOME',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Category breakdown (monthly expenses)
      prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId: req.userId!,
          type: 'EXPENSE',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Weekly expenses
    const weeklyExpenses = await prisma.transaction.aggregate({
      where: {
        userId: req.userId!,
        type: 'EXPENSE',
        date: { gte: startOfWeek },
      },
      _sum: { amount: true },
    });

    // Calculate budget
    const totalIncome = Number(monthlyIncome._sum.amount || 0);
    const totalExpenses = Number(monthlyExpenses._sum.amount || 0);
    const available = totalIncome - totalExpenses;
    const spentPercentage = totalIncome > 0
      ? Math.round((totalExpenses / totalIncome) * 100)
      : 0;

    res.json({
      status: 'success',
      data: {
        monthly: {
          income: totalIncome,
          expenses: totalExpenses,
          available,
          spentPercentage,
          transactionCount: {
            income: monthlyIncome._count,
            expenses: monthlyExpenses._count,
          }
        },
        weekly: {
          expenses: weeklyExpenses._sum.amount || 0,
        },
        categories: categoryBreakdown
          .map(cat => ({
            category: cat.category,
            amount: Number(cat._sum.amount || 0),
            count: cat._count,
            percentage: totalExpenses > 0
              ? Math.round((Number(cat._sum.amount || 0) / totalExpenses) * 100)
              : 0,
          }))
          .sort((a, b) => b.amount - a.amount),
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get monthly trend (last 6 months)
router.get('/trend', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        date: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (t.type === 'INCOME') {
        monthlyData[monthKey].income += Number(t.amount);
      } else {
        monthlyData[monthKey].expenses += Number(t.amount);
      }
    });

    const trend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      status: 'success',
      data: { trend }
    });
  } catch (error) {
    next(error);
  }
});

export { router as statsRouter };
