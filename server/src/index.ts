import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pixelRoutes from './routes/pixelRoutes';


dotenv.config();

const app = express(); 

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', pixelRoutes); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
