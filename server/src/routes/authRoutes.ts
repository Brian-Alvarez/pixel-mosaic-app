import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // generates unique user IDs

const router = express.Router();

// TEMPORARY: in-memory store
const users: { id: string; email: string; password: string }[] = [];

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), email, password: hashedPassword };

  users.push(newUser);

  res.status(201).json({ message: 'User created!' });
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  // 🛡️ Create JWT with BOTH email and id
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  res.json({ token });
});

export default router;
