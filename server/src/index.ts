import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pixelRoutes, { initializePixelGrid } from './routes/pixelRoutes';
import stripeRoutes from './routes/stripeRoutes';
import { webhookRoutes } from './routes/webhook';
import { prisma } from './db/prisma';


dotenv.config();

const app = express();

app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors());
app.use(express.json({ limit: "5mb" })); // Increased limit for larger payloads

// Routes
app.use('/api', authRoutes);
app.use('/api', pixelRoutes);
app.use('/api', stripeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  const pixelCount = await prisma.pixel.count();
  if (pixelCount === 0) {
    await initializePixelGrid();
    console.log('Pixel grid initialized.');
  } else {
    console.log('Pixel grid already initialized.');
  }
});
