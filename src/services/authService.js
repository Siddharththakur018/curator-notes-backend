const prisma = require("../lib/prisma");

const syncUserService = async (firebaseUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: firebaseUser.uid,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const newUser = await prisma.user.create({
    data: {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || "",
    },
  });

  return newUser;
};

module.exports = syncUserService;