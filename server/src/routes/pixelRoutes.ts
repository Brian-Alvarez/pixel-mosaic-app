// src/routes/pixelRoutes.ts
import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

// In-memory pixel store: 10x10 grid = 100 pixels (0 to 99)
const pixelStore: {
  [id: string]: { color: string; ownerId: string | null };
} = {};

for (let i = 0; i < 100; i++) {
  pixelStore[i] = { color: '#ffffff', ownerId: null }; // default: white, no owner
}

const router = Router();

router.post('/pixels/:id/color', authenticateJWT, (req: Request, res: Response) => {
  const { id } = req.params;
  const { color } = req.body;
  const userId = req.user?.id;

  if (!color) return res.status(400).json({ message: 'Missing color' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const pixel = pixelStore[id];
  if (!pixel) return res.status(404).json({ message: 'Pixel not found' });

  // If pixel is unowned, assign to user
  if (pixel.ownerId === null) {
    pixel.ownerId = userId;
    pixel.color = color;
    return res.status(200).json({ message: `Pixel ${id} claimed and updated.` });
  }

  // If user owns it, allow color change
  if (pixel.ownerId === userId) {
    pixel.color = color;
    return res.status(200).json({ message: `Pixel ${id} color updated.` });
  }

  // Otherwise, reject
  return res.status(403).json({ message: 'You do not own this pixel.' });
});

router.get('/pixels', (req: Request, res: Response) => {
  res.status(200).json(pixelStore);
});


export default router;
