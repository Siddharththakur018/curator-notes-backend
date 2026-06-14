const prisma = require("../lib/prisma");
const { generateContent } = require("../services/gemini.service");
const {calculateCreditFromTokens, estimateTokens} = require("../utils/credit.util")

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
      case "summarize":
        prompt = `
Summarize this note.

Rules:
- Return plain text only
- No markdown
- No asterisks
- No headings
- Each point on a new line
- Use bold to highlight important things 

${text}
`;
        break;

      case "improve":
        prompt = `Improve this writing while preserving meaning.
        Rules:
- Return plain text only
- No markdown
- No asterisks
- No headings
- Use bold to highlight important things 
- Each point on a new line
        ${text}`;
        break;

      case "extract":
        prompt = `
          Rules:
- Return plain text only
- No markdown
- No asterisks
- No headings
- Use numbers in pointers for each new line
- Each point on a new line

          ${text}
        `;
        break;

      default:
        return res.status(400).json({
          message: "Invalid action",
        });
    }

    

    const aiResponse = await generateContent(prompt, {
      maxOutputTokens: 500
    });

    const totalTokens = aiResponse.usageMetadata?.totalTokenCount || 0;
    const creditUsed = calculateCreditFromTokens(totalTokens)
    return res.status(200).json({
      success: true,
      result: aiResponse.text,
      usageMetadata: aiResponse.usageMetadata,
      creditUsed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { testAI, aiAssist };
