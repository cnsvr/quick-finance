import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth';
import { transactionRouter } from './routes/transactions';
import { statsRouter } from './routes/stats';
import { recurringRouter } from './routes/recurring';
import { categoriesRouter } from './routes/categories';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/stats', statsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/categories', categoriesRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Finance Tracker API`);
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/transactions/quick      ⚡ Super-fast entry`);
  console.log(`   POST   /api/transactions`);
  console.log(`   GET    /api/transactions`);
  console.log(`   GET    /api/transactions/:id`);
  console.log(`   PATCH  /api/transactions/:id`);
  console.log(`   DELETE /api/transactions/:id`);
  console.log(`   GET    /api/transactions/categories/suggestions`);
  console.log(`   GET    /api/stats                   📊 Budget & statistics`);
  console.log(`   GET    /api/stats/trend              📈 6-month trend`);
  console.log(`\n✨ Ready to track finances!\n`);
});
