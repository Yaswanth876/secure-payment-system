import { all, run } from '../database/database.js';
import { badRequest, notFound } from '../utils/errors.js';
import { success } from '../utils/responses.js';
import { id, requiredText, upiId } from '../utils/validation.js';

const recipientFields = 'id AS recipientId, name, upi_id AS upiId, bank_name AS bankName, masked_account_number AS maskedAccountNumber, photo, is_new AS isNew, created_at AS createdAt';

export async function getRecipient(request, response) {
  const recipientId = id(request.params.recipientId, 'recipientId');
  const rows = await all(request.app.locals.database, `SELECT ${recipientFields} FROM recipients WHERE id = ?`, [recipientId]);
  if (!rows[0]) throw notFound('RECIPIENT_NOT_FOUND', 'Recipient was not found.');
  return success(response, rows[0]);
}

export async function listRecipients(request, response) {
  const userId = id(request.params.userId, 'userId');
  const rows = await all(request.app.locals.database, `SELECT ${recipientFields} FROM recipients WHERE user_id = ? ORDER BY name`, [userId]);
  return success(response, rows);
}

export async function searchRecipients(request, response) {
  const query = requiredText(request.query.query, 'query');
  const pattern = `%${query}%`;
  const rows = await all(request.app.locals.database, `SELECT ${recipientFields} FROM recipients WHERE name LIKE ? OR upi_id LIKE ? ORDER BY name`, [pattern, pattern]);
  return success(response, rows);
}

export async function createRecipient(request, response) {
  const userId = id(request.body.userId, 'userId');
  const name = requiredText(request.body.name, 'name');
  const recipientUpiId = upiId(request.body.upiId);
  const users = await all(request.app.locals.database, 'SELECT id FROM users WHERE id = ?', [userId]);
  if (!users[0]) throw notFound('USER_NOT_FOUND', 'User was not found.');
  const duplicate = await all(request.app.locals.database, 'SELECT id FROM recipients WHERE user_id = ? AND upi_id = ?', [userId, recipientUpiId]);
  if (duplicate[0]) throw badRequest('DUPLICATE_RECIPIENT', 'This recipient is already saved for the user.');
  const result = await run(request.app.locals.database, 'INSERT INTO recipients (user_id, name, upi_id, bank_name, masked_account_number, photo, is_new) VALUES (?, ?, ?, ?, ?, ?, 1)', [userId, name, recipientUpiId, request.body.bankName || null, request.body.maskedAccountNumber || null, request.body.photo || null]);
  const rows = await all(request.app.locals.database, `SELECT ${recipientFields} FROM recipients WHERE id = ?`, [result.lastID]);
  return success(response, rows[0], 201);
}