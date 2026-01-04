import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  '1087603000982-i36rm8p5q5c55sb2vrkiob9fti6hi6fm.apps.googleusercontent.com'
);

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    let accountLinked = false;

    if (existing) {
      // If Google account exists, link it with password
      if (existing.authProvider === 'GOOGLE') {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            authProvider: 'LINKED',
            name: name || existing.name, // Keep existing name if not provided
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });
        accountLinked = true;
      } else {
        // Email or linked account already exists with password
        throw new AppError(400, 'Email already registered');
      }
    } else {
      // Create new user with EMAIL provider
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          authProvider: 'EMAIL',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    res.status(201).json({
      status: 'success',
      data: { user, token, accountLinked },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Google OAuth Sign-In
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = googleAuthSchema.parse(req.body);

    // Verify the Google ID token
    // Accept tokens from both iOS client and backend client
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [
        '1087603000982-i36rm8p5q5c55sb2vrkiob9fti6hi6fm.apps.googleusercontent.com', // Backend client
        '1087603000982-o9lmlpie9ug9115n90m9aci9ppf9bkgl.apps.googleusercontent.com', // iOS client
      ],
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new AppError(400, 'Invalid Google token');
    }

    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let existingUser = await prisma.user.findUnique({ where: { email } });

    let userId: string;
    let accountLinked = false;

    if (!existingUser) {
      // Create new user with Google OAuth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: randomPassword,
          name: name || email.split('@')[0],
          authProvider: 'GOOGLE',
          googleId,
        },
        select: {
          id: true,
        },
      });
      userId = newUser.id;
    } else {
      userId = existingUser.id;

      // User exists - handle account linking
      if (existingUser.authProvider === 'EMAIL') {
        // Email/password account trying to link with Google
        // Update to LINKED provider
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authProvider: 'LINKED',
            googleId,
          },
        });
        accountLinked = true;
      } else if (existingUser.authProvider === 'GOOGLE' || existingUser.authProvider === 'LINKED') {
        // Already a Google or linked account - just sign in
        // Update googleId in case it changed
        if (existingUser.googleId !== googleId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { googleId },
          });
        }
        accountLinked = existingUser.authProvider === 'LINKED';
      }
    }

    // Fetch the final user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      throw new AppError(500, 'Failed to retrieve user data');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        accountLinked,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Get current user info
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
});

router.patch('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        createdAt: true,
      },
    });

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Delete account
router.delete('/account', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Delete user - this will cascade delete all related data
    // (transactions, recurring transactions, etc.) due to Prisma schema onDelete: Cascade
    await prisma.user.delete({
      where: { id: req.userId },
    });

    res.json({
      status: 'success',
      message: 'Account permanently deleted',
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
