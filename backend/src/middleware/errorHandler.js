import { ApiError } from "../utils/apiResponse.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    // Mongoose validation errors, duplicate-key errors, etc. get mapped
    // to sane HTTP codes instead of leaking a raw 500 with a stack trace.
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      message = `${field} already exists`;
    } else {
      statusCode = 500;
      message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
    }
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode || 500).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}