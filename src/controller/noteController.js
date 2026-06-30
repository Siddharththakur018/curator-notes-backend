const prisma = require("../lib/prisma");

const createNote = async (req, res) => {
  try {
    const { title, content, previewText, tags, searchText } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required!" });
    }
    if (!content) {
      return res.status(400).json({ message: "Description is required!" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        previewText,
        tags,
        searchText,
        userId: req.user.id,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfully created a note", note });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const { search } = req.query;
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user.id,

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              previewText: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              tags: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              searchText: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
    });

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note don't exist" });
    }

    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note doesn't exist" });
    }

    await prisma.note.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateNoteById = async (req, res) => {
  try {
    const { title, content, previewText, tags, searchText } = req.body;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        previewText,
        tags,
        searchText
      },
    });

    return res.status(200).json({ success: true, note: updatedNote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  deleteNoteById,
  updateNoteById,
};
