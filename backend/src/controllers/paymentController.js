import { all } from '../database/database.js';
import { authorizePayment, getTransaction, listTransactions, previewPayment } from '../services/paymentService.js';
import { success } from '../utils/responses.js';
import { id } from '../utils/validation.js';

export async function preview(request, response) { return success(response, await previewPayment(request.app.locals.database, request.body), 201); }
export async function authorize(request, response) { return success(response, await authorizePayment(request.app.locals.database, request.params.transactionId, request.body.confirmation)); }
export async function status(request, response) {
  const data = await getTransaction(request.app.locals.database, request.params.transactionId);
  return success(response, { ...data, canRetry: ['FAILED'].includes(data.status), message: ['PROCESSING', 'PENDING', 'UNKNOWN'].includes(data.status) ? 'Payment is still being processed. Do not pay again.' : undefined });
}
export async function transactionDetails(request, response) { return success(response, await getTransaction(request.app.locals.database, request.params.transactionId, request.query.userId ? id(request.query.userId, 'userId') : null)); }
export async function userTransactions(request, response) { return success(response, await listTransactions(request.app.locals.database, id(request.params.userId, 'userId'), request.query)); }
export async function health(request, response) {
  await all(request.app.locals.database, 'SELECT 1');
  return success(response, { service: 'Payment Guardian API', database: 'connected' });
}
