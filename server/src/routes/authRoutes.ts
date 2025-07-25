import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { generateResetToken } from '../utils/generateToken';
import { sendPasswordResetEmail } from '../utils/sendEmail';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
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

await sgMail.send({
  to: email,
  from: 'brian@brianbuilds.dev',
  subject: 'Welcome to Pixel Mosaic!',
  text: 'Thanks for signing up. Let’s get started!',
  html: '<strong>Welcome to Pixel Mosaic! 🎉</strong><p>Enjoy creating art, one pixel at a time.</p>',
});

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

router.get('/me', verifyToken, (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, email } = user;
  res.json({ userId: id, email });
});

// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('[POST] /forgot-password ->', email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires: expires,
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: 'brian@brianbuilds.dev',
      subject: 'Reset Your Password',
      text: `Reset your password using this link: ${resetLink}`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await sgMail.send(msg);
    console.log('Email sent to:', email);
    res.status(200).json({ message: 'Reset link sent' });

  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ message: 'Error sending email' });
  }
});


router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  res.json({ message: 'Password reset successfully.' });
});


export default router;
