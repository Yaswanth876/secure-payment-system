import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authorize, preview, status, transactionDetails } from '../controllers/paymentController.js';

const router = Router();
router.post('/payments/preview', asyncHandler(preview));
router.post('/payments/:transactionId/authorize', asyncHandler(authorize));
router.get('/payments/:transactionId/status', asyncHandler(status));
router.get('/transactions/:transactionId', asyncHandler(transactionDetails));
export default router;