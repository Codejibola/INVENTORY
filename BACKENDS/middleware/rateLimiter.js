import rateLimit, { ipKeyGenerator } from "express-rate-limit";


export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 30 minutes
  max: 700, // 700 requests per IP
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // only 30 attempts per 15 mins
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

export const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req) => {
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }
    return ipKeyGenerator(req);
  }
});


