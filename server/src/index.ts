import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pixelRoutes from './routes/pixelRoutes';
import { initializePixelGrid } from './routes/pixelRoutes';
import { prisma } from './db/prisma';



dotenv.config();

const app = express(); 

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', pixelRoutes); 

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
