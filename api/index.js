const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => console.log("❌ MongoDB xatosi:", err.message));

// Oddiy test route
app.get("/", (req, res) => {
  res.json({ message: "API ishlayapti 🚀" });
});

// ROUTES qo‘shish
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

module.exports = app; // Vercel uchun
