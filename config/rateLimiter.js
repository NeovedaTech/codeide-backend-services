import rateLimit from 'express-rate-limit';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,               // max requests per IP per window
  standardHeaders: true,  // RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers

  handler: (req, res) => {
    const resetTime = req.rateLimit?.resetTime;

    let retryAfter = null;
    if (resetTime) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      );
      const minutes = Math.floor(retryAfterSeconds / 60);
      const seconds = retryAfterSeconds % 60;

      retryAfter = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return res.status(429).json({
      status: 429,
      error: 'RATE_LIMIT_EXCEEDED',
      message: retryAfter
        ? `Too many requests. Please try again in ${retryAfter} minutes.`
        : 'Too many requests. Please try again later.',
    });
  },
});
