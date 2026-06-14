const rateLimit = require("express-rate-limit");

/**
 * Generic API rate limiter
 * Use for authenticated routes
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,                 // 100 requests per minute per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down."
  }
});

/**
 * Stricter limiter for chat actions
 * (messages, reactions, seen)
 */
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,                  // tighter limit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "You are sending messages too fast."
  }
});

module.exports = {
  apiRateLimiter,
  chatRateLimiter
};
