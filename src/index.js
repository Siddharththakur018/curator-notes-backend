require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

app.get("/", (req,res) => {
    res.send("Backend Running")
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})