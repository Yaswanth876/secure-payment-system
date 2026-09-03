import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', healthRoutes);

app.listen(port, () => {
  console.log(`Payment Guardian backend listening on port ${port}`);
});