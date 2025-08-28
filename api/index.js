const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => console.log("❌ MongoDB xatosi:", err.message));

// Root test
app.get("/", (req, res) => {
  res.json({ message: "API ishlayapti 🚀" });
});

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Ism, email va parol kiritilishi kerak" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email band" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });

    res.status(201).json({ message: "User yaratildi", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Parol noto‘g‘ri" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Tizimga kirdingiz", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app; // ❌ listen emas
