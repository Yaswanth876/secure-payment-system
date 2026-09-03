import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getAccounts, getProfile, getUser } from '../controllers/userController.js';
import { listRecipients } from '../controllers/recipientController.js';
import { userTransactions } from '../controllers/paymentController.js';

const router = Router();
router.get('/users/:userId', asyncHandler(getUser));
router.get('/users/:userId/accounts', asyncHandler(getAccounts));
router.get('/users/:userId/profile', asyncHandler(getProfile));
router.get('/users/:userId/recipients', asyncHandler(listRecipients));
router.get('/users/:userId/transactions', asyncHandler(userTransactions));
export default router;