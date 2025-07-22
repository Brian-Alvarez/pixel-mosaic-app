// server/src/routes/webhook.ts
import express from 'express';
import stripe from '../utils/stripe';
import { prisma } from '../db/prisma';

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const pixelId = session.metadata.pixelId;
    const userId = session.metadata.userId;

    if (pixelId && userId) {
      await prisma.pixel.upsert({
        where: { id: pixelId },
        update: { ownerId: userId },
        create: { id: pixelId, color: '#ffffff', ownerId: userId },
      });
      console.log(`✅ Pixel ${pixelId} claimed by user ${userId}`);
    }
  }

  res.sendStatus(200);
});

export { router as webhookRoutes };
