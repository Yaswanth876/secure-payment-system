import crypto from 'node:crypto';
import { all, run } from '../database/database.js';
import { evaluateTransaction } from './SafetyEngine.js';
import { simulate } from './PaymentSimulator.js';
import { transition } from './PaymentStateMachine.js';
import { AppError, badRequest, notFound } from '../utils/errors.js';

const transactionQuery = `SELECT t.id, t.sender_user_id AS senderUserId, t.sender_account_id AS senderAccountId, t.recipient_id AS recipientId, t.amount, t.status, t.safety_status AS safetyStatus, t.created_at AS createdAt, t.updated_at AS updatedAt, r.name AS recipientName, r.upi_id AS recipientUpiId, r.bank_name AS recipientBankName, r.masked_account_number AS recipientMaskedAccountNumber, r.photo AS recipientPhoto, u.name AS senderName, u.upi_id AS senderUpiId, a.bank_name AS senderBankName, a.masked_account_number AS senderMaskedAccountNumber FROM transactions t JOIN recipients r ON r.id = t.recipient_id JOIN users u ON u.id = t.sender_user_id JOIN accounts a ON a.id = t.sender_account_id`;

function receipt(transaction, safety) {
  return {
    transactionId: transaction.id,
    recipient: { id: transaction.recipientId, name: transaction.recipientName, upiId: transaction.recipientUpiId, bankName: transaction.recipientBankName, maskedAccountNumber: transaction.recipientMaskedAccountNumber, photo: transaction.recipientPhoto },
    amount: { paise: transaction.amount, rupees: transaction.amount / 100 },
    sender: { id: transaction.senderUserId, name: transaction.senderName, upiId: transaction.senderUpiId, bankName: transaction.senderBankName, maskedAccountNumber: transaction.senderMaskedAccountNumber },
    safety: { status: safety.status, isNewRecipient: safety.isNewRecipient, amountWarning: safety.amountWarning, continuityLock: Boolean(safety.continuityLock), previousSuccessfulPayment: safety.successfulDuplicate, requiresCoolingOff: safety.requiresCoolingOff }
  };
}

async function findTransaction(database, transactionId) {
  const rows = await all(database, `${transactionQuery} WHERE t.id = ?`, [transactionId]);
  if (!rows[0]) throw notFound('TRANSACTION_NOT_FOUND', 'Transaction was not found.');
  return rows[0];
}

async function verifyPaymentReferences(database, senderUserId, senderAccountId, recipientId) {
  const rows = await all(database, 'SELECT u.id AS userId, a.id AS accountId, r.id AS recipientId FROM users u LEFT JOIN accounts a ON a.id = ? AND a.user_id = u.id LEFT JOIN recipients r ON r.id = ? AND r.user_id = u.id WHERE u.id = ?', [senderAccountId, recipientId, senderUserId]);
  if (!rows[0]) throw notFound('USER_NOT_FOUND', 'Sender user was not found.');
  if (!rows[0].accountId) throw notFound('ACCOUNT_NOT_FOUND', 'Sender account was not found for this user.');
  if (!rows[0].recipientId) throw notFound('RECIPIENT_NOT_FOUND', 'Recipient was not found for this user.');
}

async function recordSafety(database, transactionId, eventType, message, metadata = {}) {
  await run(database, 'INSERT INTO safety_events (transaction_id, event_type, message, metadata) VALUES (?, ?, ?, ?)', [transactionId, eventType, message, JSON.stringify(metadata)]);
}

export async function previewPayment(database, input) {
  const senderUserId = Number(input.senderUserId);
  const senderAccountId = Number(input.senderAccountId);
  const recipientId = Number(input.recipientId);
  const amount = Number(input.amount);
  if (![senderUserId, senderAccountId, recipientId].every(Number.isSafeInteger) || senderUserId <= 0 || senderAccountId <= 0 || recipientId <= 0) throw badRequest('INVALID_REQUEST', 'Payment references must be valid positive integers.');
  if (!Number.isSafeInteger(amount) || amount <= 0) throw badRequest('INVALID_AMOUNT', 'amount must be a positive integer in paise.');
  await verifyPaymentReferences(database, senderUserId, senderAccountId, recipientId);
  const safety = await evaluateTransaction(database, { senderUserId, recipientId, amount });
  const transactionId = `TXN-${crypto.randomUUID()}`;
  await run(database, 'INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status, safety_status) VALUES (?, ?, ?, ?, ?, ?, ?)', [transactionId, senderUserId, senderAccountId, recipientId, amount, 'CREATED', safety.status]);
  const transaction = await findTransaction(database, transactionId);
  if (safety.isNewRecipient) await recordSafety(database, transactionId, 'NEW_RECIPIENT', 'This is a new recipient. Please carefully verify the recipient details.');
  if (safety.amountWarning) await recordSafety(database, transactionId, 'AMOUNT_WARNING', safety.amountWarning.message, safety.amountWarning);
  return receipt(transaction, safety);
}

export async function authorizePayment(database, transactionId, confirmation) {
  const transaction = await findTransaction(database, transactionId);
  if (transaction.status !== 'CREATED') return { ...transaction, alreadyProcessed: true };
  if (confirmation?.recipientConfirmed !== true || confirmation?.amountConfirmed !== true) throw badRequest('INVALID_CONFIRMATION', 'Explicit recipient and amount confirmation are required.');
  const safety = await evaluateTransaction(database, transaction);
  if (safety.continuityLock) {
    await run(database, 'UPDATE transactions SET safety_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['LOCKED', transactionId]);
    await recordSafety(database, transactionId, 'CONTINUITY_LOCK', 'A matching payment must be resolved before another payment is authorized.', { existingTransactionId: safety.continuityLock.id, existingStatus: safety.continuityLock.status, amount: transaction.amount, recipientId: transaction.recipientId });
    throw new AppError(409, 'CONTINUITY_LOCK', 'A previous payment with the same recipient and amount is still unresolved.', { existingTransactionId: safety.continuityLock.id, existingStatus: safety.continuityLock.status, canRetry: false });
  }
  await recordSafety(database, transactionId, 'USER_CONFIRMED', 'The user confirmed the recipient and amount.');
  await transition(database, transactionId, 'CREATED', 'AUTHORIZED');
  await recordSafety(database, transactionId, 'PAYMENT_AUTHORIZED', 'Payment authorization was accepted by the backend.');
  await simulate(database, transaction);
  return findTransaction(database, transactionId);
}

export async function getTransaction(database, transactionId, userId = null) {
  const transaction = await findTransaction(database, transactionId);
  if (userId !== null && transaction.senderUserId !== userId) throw new AppError(403, 'UNAUTHORIZED_TRANSACTION', 'You are not authorized to access this transaction.');
  const events = await all(database, 'SELECT id, event_type AS eventType, message, metadata, created_at AS createdAt FROM safety_events WHERE transaction_id = ? ORDER BY created_at, id', [transactionId]);
  return { transactionId: transaction.id, status: transaction.status, safetyStatus: transaction.safetyStatus, recipient: { id: transaction.recipientId, name: transaction.recipientName, upiId: transaction.recipientUpiId, bankName: transaction.recipientBankName, maskedAccountNumber: transaction.recipientMaskedAccountNumber }, amount: { paise: transaction.amount, rupees: transaction.amount / 100 }, sender: { id: transaction.senderUserId, name: transaction.senderName, upiId: transaction.senderUpiId, bankName: transaction.senderBankName, maskedAccountNumber: transaction.senderMaskedAccountNumber }, createdAt: transaction.createdAt, updatedAt: transaction.updatedAt, events };
}

export async function listTransactions(database, userId, filters) {
  const users = await all(database, 'SELECT id FROM users WHERE id = ?', [userId]);
  if (!users[0]) throw notFound('USER_NOT_FOUND', 'User was not found.');
  const values = [userId];
  const conditions = ['t.sender_user_id = ?'];
  if (filters.status) { conditions.push('t.status = ?'); values.push(filters.status); }
  if (filters.recipient) { conditions.push('t.recipient_id = ?'); values.push(Number(filters.recipient)); }
  const rows = await all(database, `${transactionQuery} WHERE ${conditions.join(' AND ')} ORDER BY t.created_at DESC`, values);
  return rows.map(transaction => ({ transactionId: transaction.id, recipient: { id: transaction.recipientId, name: transaction.recipientName, upiId: transaction.recipientUpiId }, amount: { paise: transaction.amount, rupees: transaction.amount / 100 }, status: transaction.status, safetyStatus: transaction.safetyStatus, createdAt: transaction.createdAt, updatedAt: transaction.updatedAt }));
}