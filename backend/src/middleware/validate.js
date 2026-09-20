import { ApiError } from "../utils/apiResponse.js";

/**
 * Validates req.body against a Zod schema. On failure, throws a 400 with
 * a flattened field->message map so the frontend can highlight exact
 * fields instead of showing one generic error string.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", details);
  }

  req.body = result.data;
  next();
};