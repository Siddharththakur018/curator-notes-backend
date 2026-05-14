const express = require("express")
const router = express.Router()
const syncUserController = require("../controller/authController")

router.post('/sync-user', syncUserController);

module.exports = router