import rateLimit from 'express-rate-limit';

// Generic limiter: 5 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Please wait a minute and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export default authLimiter;