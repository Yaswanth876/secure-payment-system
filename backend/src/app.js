import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import database from './database/database.js';
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recipientRoutes from './routes/recipientRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.locals.database = database;
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/images', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '../images')));
app.use('/api', healthRoutes);
app.use('/api', userRoutes);
app.use('/api', recipientRoutes);
app.use('/api', paymentRoutes);
app.use(errorHandler);

export default app;