import express from 'express';
import stripe from '../utils/stripe';
import { authenticateJWT } from '../middleware/authMiddleware';
import { prisma } from '../db/prisma';

const router = express.Router();

router.post('/checkout', authenticateJWT, async (req, res) => {
  const { pixelId } = req.body;
  const userId = req.user?.id;

  if (!pixelId || !/^\d{1,2}-\d{1,2}$/.test(pixelId)) {
    return res.status(400).json({ error: 'Invalid pixel ID.' });
  }

  const pixel = await prisma.pixel.findUnique({ where: { id: pixelId } });

  if (pixel && pixel.ownerId) {
    return res.status(400).json({ error: 'Pixel is already owned.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pixel ${pixelId}`,
            },
            unit_amount: 100, // $1.00
          },
          quantity: 1,
        },
      ],
        metadata: {
            pixelId,
            userId: userId || '',
        },
      success_url: `${process.env.CLIENT_URL}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Something went wrong creating the session.' });
  }
});

export default router;
