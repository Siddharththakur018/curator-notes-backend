const prisma = require("../lib/prisma");
const CREDIT_TOKEN_RATIO = 100;

const calculateCreditFromTokens = (totalTokens = 0) => {
  return Math.max(1, Math.ceil(totalTokens / CREDIT_TOKEN_RATIO));
};

const estimateTokens = (text = "") => {
  return Math.ceil(text.length / 4);
};

const checkAndResetCredits = async (userId) => {
  let user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if(!user){
    return null;
  }
  const now = new Date();
  const lastReset = new Date(user.lastCreditReset);

  const sameMonth =
    lastReset.getMonth() === now.getMonth() &&
    lastReset.getFullYear() === now.getFullYear();

  if (!sameMonth) {
    user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        aiCredits: 1000,
        lastCreditReset: now,
      },
    });
  }
};

module.exports = {
  calculateCreditFromTokens,
  estimateTokens,
  checkAndResetCredits,
};
