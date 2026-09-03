export class AppError extends Error {
  constructor(status, code, message, data) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function notFound(code, message) {
  return new AppError(404, code, message);
}

export function badRequest(code, message, data) {
  return new AppError(400, code, message, data);
}