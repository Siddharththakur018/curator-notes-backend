const prisma = require("../lib/prisma");
const { generateContent } = require("../services/gemini.service");
const {
  calculateCreditFromTokens,
  estimateTokens,
} = require("../utils/credit.util");

// for testing purpose to check whether api call is happening or not from gemini
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
    // extract text and action means what the user has demanded like summarize, improve etc
    const { text, action } = req.body;

    // validation to check whether the text exist or not
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json("Text is required!");
    }

    // finding user if the user exits or not
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.uid,
      },
    });

    if (!user) {
      return res.status(404).json("User doesn't exist");
    }

    // the prompt means the action gemini api needs to do
    let prompt = "";

    switch (action) {
      case "summarize":
        prompt = `
You are an AI writing assistant inside a notes app.

Task:
Summarize the user's note into a clear and useful summary.

Output rules:
- Return only the final answer
- Use plain text only
- Do not use markdown
- Do not use headings
- Do not use asterisks
- Do not add extra commentary
- Return 3 to 6 useful points when enough information is available
- If the note is very short, return the best possible summary without inventing details
- Write each point on a new line
- Keep each point clear and meaningful
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
- Improve grammar, clarity, flow, tone, and readability
- Keep the original intent and information
- Do not invent new information
- Keep paragraph breaks where helpful

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
- Return only the extracted information
- Use plain text only
- Do not use markdown
- Do not use headings
- Do not use asterisks
- Use numbered points
- Return up to 8 important points
- Include key facts, tasks, decisions, dates, names, deadlines, and important details
- Do not repeat the same idea
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
    const maxOutputTokens = 4000;
    const estimateInputTokens = estimateTokens(prompt);
    const estimatedTotalTokens = estimateInputTokens + maxOutputTokens;
    const estimateCredits = calculateCreditFromTokens(estimatedTotalTokens);

    // check whether user have credits or not
    const creditReservation = await prisma.user.updateMany({
      where: {
        id: req.user.uid,
        aiCredits: {
          gte: estimateCredits,
        },
      },
      data: {
        aiCredits: {
          decrement: estimateCredits,
        },
      },
    });

    // credit count is 0 then insufficient balance as no api calls can be done
    if (creditReservation.count === 0) {
      return res.status(402).json({
        success: false,
        message: "Insufficient AI credits",
        requiredCredits: estimateCredits,
        availableCredits: user.aiCredits,
      });
    }

    // maximum tokens we are finding when any prompt is used by gemini to calculate credit used by user
    const aiResponse = await generateContent(prompt, {
      maxOutputTokens,
    });

    // finding total tokens used by gemini
    const totalTokens =
      aiResponse.usageMetadata?.totalTokenCount || estimatedTotalTokens;

    // calculating total credit used by gemini from the remaining credits
    const creditUsed = calculateCreditFromTokens(totalTokens);

    // refund unused reserved credits
    const refundCredits = Math.max(estimateCredits - creditUsed, 0);

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.uid,
      },
      data: {
        aiCredits: {
          increment: refundCredits,
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
      credits: {
        used: creditUsed,
        reserved: estimateCredits,
        refunded: refundCredits,
        remaining: updatedUser.aiCredits,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { testAI, aiAssist };
