import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createRecipient, getRecipient, searchRecipients } from '../controllers/recipientController.js';

const router = Router();
router.get('/recipients/search', asyncHandler(searchRecipients));
router.get('/recipients/:recipientId', asyncHandler(getRecipient));
router.post('/recipients', asyncHandler(createRecipient));
export default router;