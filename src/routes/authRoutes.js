const express = require("express")
const router = express.Router()
const syncUserController = require("../controller/authController")
const  verifyFirebaseToken = require("../middleware/authMiddleware");

router.post('/sync-user',verifyFirebaseToken ,syncUserController);

module.exports = router