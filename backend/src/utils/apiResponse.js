export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export function ok(res, data, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function created(res, data, message = "Created") {
  return ok(res, data, message, 201);
}