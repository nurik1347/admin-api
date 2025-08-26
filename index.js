const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// MongoDB ulanish
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => console.error("❌ MongoDB xatosi:", err.message));

// Schema va model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Auth middleware
const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Token yo‘q" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Ruxsat yo‘q" });
      }
      next();
    } catch (e) {
      res.status(401).json({ error: "Noto‘g‘ri yoki muddati o‘tgan token" });
    }
  };
};

// ================= AUTH ROUTES =================

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Ism, email va parol kiritilishi kerak" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email band" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json({ message: "User yaratildi", user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
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
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ================= ADMIN ROUTELAR =================

// Userlarni olish
app.get("/api/users", auth(["admin"]), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Bitta user olish
app.get("/api/users/:id", auth(["admin"]), async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json(user);
});

// User qo‘shish (admin)
app.post("/api/users", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// User yangilash
app.put("/api/users/:id", auth(["admin"]), async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true }
  ).select("-password");
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json(user);
});

// User o‘chirish
app.delete("/api/users/:id", auth(["admin"]), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json({ message: "User o‘chirildi" });
});

// Vercel uchun export (⚡️ Muhim!)
module.exports = app;