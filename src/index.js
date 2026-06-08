require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const geminiRoutes = require("./routes/geminiRoutes")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/gemini", geminiRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
