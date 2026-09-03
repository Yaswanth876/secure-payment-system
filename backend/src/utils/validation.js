import { badRequest } from './errors.js';

export function positiveInteger(value, fieldName) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw badRequest('INVALID_AMOUNT', `${fieldName} must be a positive integer.`);
  return parsed;
}

export function id(value, fieldName) {
  if (!/^\d+$/.test(String(value))) throw badRequest('INVALID_REQUEST', `${fieldName} must be a valid identifier.`);
  return Number(value);
}

export function requiredText(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) throw badRequest('INVALID_REQUEST', `${fieldName} is required.`);
  return value.trim();
}

export function upiId(value) {
  const result = requiredText(value, 'upiId');
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(result)) throw badRequest('INVALID_REQUEST', 'upiId must use a valid basic UPI ID format.');
  return result;
}