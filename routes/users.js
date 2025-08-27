const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware: faqat admin kirishi uchun
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
    } catch (err) {
      res.status(401).json({ error: "Noto‘g‘ri yoki muddati o‘tgan token" });
    }
  };
};

// Userlarni olish
router.get("/", auth(["admin"]), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Bitta user olish
router.get("/:id", auth(["admin"]), async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json(user);
});

// User qo‘shish
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User yangilash
router.put("/:id", auth(["admin"]), async (req, res) => {
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
router.delete("/:id", auth(["admin"]), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User topilmadi" });
  res.json({ message: "User o‘chirildi" });
});

module.exports = router;
