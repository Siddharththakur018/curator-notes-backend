const express = require("express");
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  deleteNoteById,
  updateNoteById,
} = require("../controller/noteController");
const { verifyFirebaseToken, dbUserFecther } = require("../middleware/authMiddleware");

router.post("/", verifyFirebaseToken,dbUserFecther, createNote);

router.get("/", verifyFirebaseToken,dbUserFecther, getAllNotes);

router.get("/:id", verifyFirebaseToken,dbUserFecther, getNoteById);

router.put("/:id", verifyFirebaseToken,dbUserFecther, updateNoteById);

router.delete("/:id", verifyFirebaseToken,dbUserFecther, deleteNoteById);

module.exports = router;
