import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { health } from '../controllers/paymentController.js';

const router = Router();
router.get('/health', asyncHandler(health));
export default router;