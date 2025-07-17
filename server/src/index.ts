import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
