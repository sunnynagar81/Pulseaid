import rateLimit from "express-rate-limit";

/**
 * General limiter for all /api routes — generous, just to blunt abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please slow down" },
});

/**
 * Tighter limiter for auth endpoints (login/register) — these are the
 * routes brute-force attempts actually target.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts — try again later" },
});

/**
 * Stricter still for request creation — this is what fans out real
 * Socket.io alerts to donors, so it's the endpoint most worth protecting
 * from accidental or malicious spam.
 */
export const createRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests posted — please wait before posting another" },
});