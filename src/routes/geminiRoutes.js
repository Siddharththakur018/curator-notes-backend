const { aiAssist } = require("../controller/geminiController");
const express = require("express");
const {
  verifyFirebaseToken,
  dbUserFecther,
} = require("../middleware/authMiddleware");
const { aiRateLimitMiddleware } = require("../middleware/aiRateLimiter");
const router = express.Router();

router.post(
  "/assist",
  verifyFirebaseToken,
  dbUserFecther,
  aiRateLimitMiddleware,
  aiAssist,
);

module.exports = router;
