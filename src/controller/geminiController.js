const prisma = require("../lib/prisma");
const { generateContent } = require("../services/gemini.service");

const testAI = async (req, res) => {
  try {
    const result = await generateContent("Explain React in 2 lines");

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const aiAssist = async (req, res) => {
  try {
    const { text, action } = req.body;

    if (!text) {
      return res.status(400).json("Text is required!");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.uid,
      },
    });

    if (!user) {
      return res.status(404).json("User doesn't exist");
    }

    let prompt = "";

    switch (action) {
      case summarize:
        prompt = `
          Summarize this note in concise bullet points.

          ${text}
        `;
        break;

      case improve:
        promt = `Improve this writing while preserving meaning. ${text}`;
        break;

      case "extract":
        prompt = `
          Extract key ideas and action items.

          ${text}
        `;
        break;

      default:
        return res.status(400).json({
          message: "Invalid action",
        });
    }

    const result = generateContent(prompt);
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { testAI, aiAssist };
