const prisma = require("../lib/prisma");
const { generateContent } = require("../services/gemini.service");
const {
  calculateCreditFromTokens,
  estimateTokens,
} = require("../utils/credit.util");

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

    if (!text || typeof text !== String || !text.trim()) {
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

    // check whether user have credits or not
    if (user.aiCredits <= 0) {
      return res
        .status(402)
        .json({ success: false, message: "Insufficient AI credits" });
    }

    let prompt = "";

    switch (action) {
      case "summarize":
        prompt = `
You are an AI writing assistant inside a notes app.

Task:
Summarize the user's note into clear, useful points.

Output rules:
- Return only the final answer
- Use plain text only
- Do not use markdown
- Do not use headings
- Do not use asterisks
- Do not add extra commentary
- Write each point on a new line
- Keep the summary concise
- Preserve the original meaning
- Do not invent information

User note:
${text}
`;
        break;

      case "improve":
        prompt = `
You are an AI writing assistant inside a notes app.

Task:
Improve the user's writing while preserving the original meaning.

Output rules:
- Return only the improved version
- Use plain text only
- Do not use markdown
- Do not use headings
- Do not use asterisks
- Do not add extra commentary
- Keep the same language as the user's input
- Improve grammar, clarity, flow, and readability
- Do not change the core meaning
- Do not invent new information

User text:
${text}
`;
        break;

      case "extract":
        prompt = `
You are an AI writing assistant inside a notes app.

Task:
Extract the most important information from the user's note.

Output rules:
- Return only the extracted points
- Use plain text only
- Do not use markdown
- Do not use headings
- Do not use asterisks
- Use numbered points
- Put each point on a new line
- Focus on key facts, tasks, decisions, dates, names, and important details
- Do not invent information
- If there is no useful information to extract, return: No key information found.

User note:
${text}
`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
        });
    }

    // check edge case if credits less than token which are gonna be used
    const maxOutputTokens = 500;
    const estimateInputTokens = estimateTokens(prompt);
    const estimatedTotalTokens = estimateInputTokens + maxOutputTokens;
    const estimateCredits = calculateCreditFromTokens(estimatedTotalTokens);

    if (user.aiCredits < estimateCredits) {
      return res.status(402).json({
        success: false,
        message: "Insufficient AI credits",
        requiredCredits: estimateCredits,
        availableCredits: user.aiCredits,
      });
    }

    const aiResponse = await generateContent(prompt, {
      maxOutputTokens,
    });

    const totalTokens = aiResponse.usageMetadata?.totalTokenCount || 0;
    const creditUsed = calculateCreditFromTokens(totalTokens);

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.uid,
      },
      data: {
        aiCredits: {
          decrement: creditUsed,
        },
      },
      select: {
        aiCredits: true,
      },
    });
    return res.status(200).json({
      success: true,
      result: aiResponse.text,
      usageMetadata: aiResponse.usageMetadata,
      creditUsed,
      remainingCredits: updatedUser.aiCredits,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { testAI, aiAssist };
