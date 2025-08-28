const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },             // 1️⃣ Ism
    email: { type: String, required: true, unique: true }, // 2️⃣ Email
    password: { type: String, required: true },         // 3️⃣ Parol
    role: { type: String, enum: ["user", "admin"], default: "user" }, // 4️⃣ Roli
    
    phone: { type: String },            
    address: { type: String },        
    age: { type: Number },              
    gender: { type: String, enum: ["male", "female", "other"] },
    isActive: { type: Boolean, default: true }, 
    lastLogin: { type: Date }          
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
