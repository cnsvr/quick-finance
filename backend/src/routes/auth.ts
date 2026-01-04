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
    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with EMAIL provider
    const user = await prisma.user.create({
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

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });

    res.status(201).json({
      status: 'success',
      data: { user, token },
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
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user with Google OAuth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await prisma.user.create({
        data: {
          email,
          password: randomPassword,
          name: name || email.split('@')[0],
          authProvider: 'GOOGLE',
          googleId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } else {
      // User exists - handle account linking
      if (user.authProvider === 'EMAIL') {
        // Email/password account trying to link with Google
        // Update to LINKED provider
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: 'LINKED',
            googleId,
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });
      } else if (user.authProvider === 'GOOGLE' || user.authProvider === 'LINKED') {
        // Already a Google or linked account - just sign in
        // Update googleId in case it changed
        if (user.googleId !== googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId },
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
            },
          });
        }
      }
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
        accountLinked: user.authProvider === 'LINKED',
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

export { router as authRouter };
