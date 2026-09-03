import { badRequest } from '../utils/errors.js';
import { run } from '../database/database.js';

const transitions = {
  CREATED: ['AUTHORIZED'],
  AUTHORIZED: ['PROCESSING'],
  PROCESSING: ['PENDING', 'SUCCESS', 'FAILED', 'UNKNOWN'],
  PENDING: ['SUCCESS', 'FAILED'],
  UNKNOWN: ['SUCCESS', 'FAILED'],
  SUCCESS: [],
  FAILED: []
};

export async function transition(database, transactionId, currentStatus, nextStatus) {
  if (!transitions[currentStatus]?.includes(nextStatus)) throw badRequest('INVALID_STATE_TRANSITION', `Cannot transition transaction from ${currentStatus} to ${nextStatus}.`);
  await run(database, "UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?", [nextStatus, transactionId, currentStatus]);
  await run(database, 'INSERT INTO safety_events (transaction_id, event_type, message, metadata) VALUES (?, ?, ?, ?)', [transactionId, 'STATUS_CHANGED', `Transaction status changed to ${nextStatus}.`, JSON.stringify({ from: currentStatus, to: nextStatus })]);
}

export { transitions };