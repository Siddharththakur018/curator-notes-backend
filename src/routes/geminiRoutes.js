const {testAI, aiAssist} = require("../controller/geminiController")
const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const router = express.Router()

router.get("/test", testAI);
router.post("/assist",verifyFirebaseToken, aiAssist)

module.exports = router