import { error } from '../utils/responses.js';

export function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

export function errorHandler(errorObject, _request, response, _next) {
  if (errorObject.code === 'SQLITE_CONSTRAINT') {
    return error(response, { status: 409, code: 'CONSTRAINT_VIOLATION', message: 'The request conflicts with existing data.' });
  }
  return error(response, errorObject);
}