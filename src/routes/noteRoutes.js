const express = require("express");
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  deleteNoteById,
  updateNoteById,
} = require("../controller/noteController");
const verifyFirebaseToken = require("../middleware/authMiddleware");

router.post("/", verifyFirebaseToken, createNote);

router.get("/", verifyFirebaseToken, getAllNotes);

router.get("/:id", verifyFirebaseToken, getNoteById);

router.put("/:id", verifyFirebaseToken, updateNoteById);

router.delete("/:id", verifyFirebaseToken, deleteNoteById);

module.exports = router;
