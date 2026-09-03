import { all } from '../database/database.js';

const unresolvedStatuses = ['PROCESSING', 'PENDING', 'UNKNOWN'];

export async function evaluateTransaction(database, { senderUserId, recipientId, amount }) {
  const recipientRows = await all(database, 'SELECT is_new AS isNewRecipient FROM recipients WHERE id = ? AND user_id = ?', [recipientId, senderUserId]);
  const recipient = recipientRows[0];
  const previousPayments = await all(database, "SELECT amount FROM transactions WHERE sender_user_id = ? AND recipient_id = ? AND status = 'SUCCESS' ORDER BY created_at DESC", [senderUserId, recipientId]);
  const existingUnresolved = await all(database, `SELECT id, status FROM transactions WHERE sender_user_id = ? AND recipient_id = ? AND amount = ? AND status IN (${unresolvedStatuses.map(() => '?').join(',')}) ORDER BY created_at DESC LIMIT 1`, [senderUserId, recipientId, amount, ...unresolvedStatuses]);
  const existingSuccess = await all(database, "SELECT id, status FROM transactions WHERE sender_user_id = ? AND recipient_id = ? AND amount = ? AND status = 'SUCCESS' ORDER BY created_at DESC LIMIT 1", [senderUserId, recipientId, amount]);

  let amountWarning = null;
  if (previousPayments.length > 0) {
    const largestPrevious = Math.max(...previousPayments.map(payment => payment.amount));
    if (amount > largestPrevious * 2) {
      const multiplier = amount / largestPrevious;
      amountWarning = {
        type: 'LARGE_INCREASE',
        message: `This payment is ${Number.isInteger(multiplier) ? multiplier : multiplier.toFixed(1)}× larger than your previous payment to this recipient.`
      };
    }
  }

  return {
    status: existingUnresolved.length ? 'LOCKED' : 'NORMAL',
    isNewRecipient: Boolean(recipient?.isNewRecipient),
    amountWarning,
    continuityLock: existingUnresolved[0] || null,
    previousPayments,
    successfulDuplicate: existingSuccess[0] || null,
    requiresCoolingOff: false
  };
}