const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/users");

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Mongo ulanish (process.env.MONGO_URI dan foydalaniladi)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB ulandi"))
  .catch((err) => console.log(err));

// Vercel uchun export
module.exports = app;

