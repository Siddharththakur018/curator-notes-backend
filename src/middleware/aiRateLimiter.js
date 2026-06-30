const { userLimiter, premiumLimiter } = require("../lib/rateLimit");

const aiRateLimitMiddleware = async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN") return next();

    const limiter = req.user.role === "PREMIUM" ? premiumLimiter : userLimiter;

    const { success } = await limiter.limit(req.user.id);

    if (!success) {
      return res.status(429).json({ message: "Too many requests!" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {aiRateLimitMiddleware}
