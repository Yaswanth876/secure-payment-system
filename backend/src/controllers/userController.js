import { all } from '../database/database.js';
import { notFound } from '../utils/errors.js';
import { id } from '../utils/validation.js';
import { success } from '../utils/responses.js';

export async function getUser(request, response) {
  const userId = id(request.params.userId, 'userId');
  const rows = await all(request.app.locals.database, 'SELECT id, name, upi_id AS upiId, created_at AS createdAt FROM users WHERE id = ?', [userId]);
  if (!rows[0]) throw notFound('USER_NOT_FOUND', 'User was not found.');
  return success(response, rows[0]);
}

export async function getAccounts(request, response) {
  const userId = id(request.params.userId, 'userId');
  const rows = await all(request.app.locals.database, 'SELECT id, bank_name AS bankName, account_type AS accountType, masked_account_number AS maskedAccountNumber FROM accounts WHERE user_id = ? ORDER BY id', [userId]);
  return success(response, rows);
}

export async function getProfile(request, response) {
  const userId = id(request.params.userId, 'userId');
  const users = await all(request.app.locals.database, 'SELECT id, name, upi_id AS upiId FROM users WHERE id = ?', [userId]);
  if (!users[0]) throw notFound('USER_NOT_FOUND', 'User was not found.');
  const accounts = await all(request.app.locals.database, 'SELECT id, bank_name AS bankName, account_type AS accountType, masked_account_number AS maskedAccountNumber FROM accounts WHERE user_id = ? ORDER BY id', [userId]);
  return success(response, { ...users[0], accounts });
}