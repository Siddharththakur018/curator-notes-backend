const admin = require("../config/firebaseAdmin");
const prisma = require("../lib/prisma");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const match = authHeader?.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = match[1].trim();

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const dbUserFecther = async (req, res, next) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: {
        id: req.user.uid,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        aiCredits: true,
        lastCreditReset: true,
      },
    });

    if (!dbUser) {
      return res
        .status(404)
        .json({ message: "User not found. Please sync user first." });
    }

    req.user = {
      firebase: req.user,
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      aiCredits: dbUser.aiCredits,
      lastCreditReset: dbUser.lastCreditReset,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {verifyFirebaseToken, dbUserFecther};
