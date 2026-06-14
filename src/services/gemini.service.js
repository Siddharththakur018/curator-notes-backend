const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateContent = async (prompt, options={}) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: options.maxOutputTokens || 500,
        temperature: options.temperature || 0.7
      }
    });

    return {
      text: result.text,
      usageMetadata: result.usageMetadata
    }
  } catch (error) {
    console.error("Gemini Error:", error);

    throw new Error(
      error?.message || "Failed to generate AI content"
    );
  }
};

module.exports = {
  generateContent,
};