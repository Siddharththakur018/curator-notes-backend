const { loginLimiter } = require("../lib/rateLimit");

const loginRateLimitMiddleware = async (req, res, next) => {
  try {
    const userIp = req.ip;
    const { success, reset } = await loginLimiter.limit(userIp);

    if (!success) {
      return res.status(429).json({
        message: "Too many login attempts. Try again later.",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { loginRateLimitMiddleware };
