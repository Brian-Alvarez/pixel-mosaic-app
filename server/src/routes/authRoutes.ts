import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// JWT payload shape
interface JWTPayload {
  id: string;
  email: string;
}

// Extend Request type
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// ✅ Safer middleware definition with explicit RequestHandler
const verifyToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { id: uuidv4(), email, password: hashed }
  });

  res.status(201).json({ message: 'User created!' });
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  res.json({ token, userId: user.id, email: user.email });
});

// ✅ Fixed route handler signature
router.get('/me', verifyToken, (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, email } = user;
  res.json({ userId: id, email });
});

export default router;
