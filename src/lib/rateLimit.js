const { Ratelimit } = require("@upstash/ratelimit");
const { redis } = require("./redis");

const userLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, "60 s"),
  prefix: "ratelimit:user",
});

const premiumLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, "60 s"),
  prefix: "ratelimit:premium",
});

const loginLimiter = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:login"
})

module.exports = {userLimiter, premiumLimiter, loginLimiter}
