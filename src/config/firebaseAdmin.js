require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const firebaseEnvKeys = {
  projectId: "FIREBASE_PROJECT_ID",
  clientEmail: "FIREBASE_CLIENT_EMAIL",
  privateKey: "FIREBASE_PRIVATE_KEY",
};

function getCredential() {
  const missingEnvKeys = Object.values(firebaseEnvKeys).filter(
    (key) => !process.env[key],
  );

  if (missingEnvKeys.length === 0) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    );

    return admin.credential.cert(serviceAccount);
  }

  throw new Error(
    [
      `Firebase Admin is not configured. Missing: ${missingEnvKeys.join(", ")}.`,
      `Set all Firebase environment variables or add a service account file at ${serviceAccountPath}.`,
    ].join(" "),
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
  });
}

module.exports = admin;
