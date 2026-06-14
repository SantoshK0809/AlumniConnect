/**
 * Global Error Handling Middleware
 * Catches all errors passed via next(err) and Multer/Mongoose/JWT errors.
 */

function globalErrorHandler(err, req, res, next) {
  console.error("🔴 ERROR:", err.message || err);

  // Already sent headers — delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // ── Multer Errors (file upload) ──────────────────────────────────
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "File size too large. Maximum allowed is 7MB.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
      LIMIT_FILE_COUNT: "Too many files uploaded.",
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || "File upload error.",
    });
  }

  // ── Multer custom file filter rejection ──────────────────────────
  if (err.message && err.message.includes("Only JPEG")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // ── Mongoose Validation Error ────────────────────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // ── Mongoose Cast Error (bad ObjectId) ───────────────────────────
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ── Mongoose Duplicate Key Error ─────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // ── JWT Errors ───────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired. Please log in again.",
    });
  }

  // ── Generic Server Error ─────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { globalErrorHandler };
