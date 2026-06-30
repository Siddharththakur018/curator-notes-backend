const {
  testAI,
  aiAssist,
  testRedis,
} = require("../controller/geminiController");
const express = require("express");
const {
  verifyFirebaseToken,
  dbUserFecther,
} = require("../middleware/authMiddleware");
const { aiRateLimitMiddleware } = require("../middleware/aiRateLimiter");
const router = express.Router();

router.get("/test", testAI);
router.post(
  "/assist",
  verifyFirebaseToken,
  dbUserFecther,
  aiRateLimitMiddleware,
  aiAssist,
);
router.get("/testRedis", testRedis);

module.exports = router;
