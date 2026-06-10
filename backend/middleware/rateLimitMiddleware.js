import rateLimit from "express-rate-limit"


// General API limiter
export const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    message: 'Too many requests, please try again later'
  }
});

// OTP limiter
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mnt
  max: 5,
  message: 'Too many requests, please try again later'
});
