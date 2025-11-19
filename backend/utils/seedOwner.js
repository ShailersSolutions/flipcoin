const mongoose = require("mongoose");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const connectDB = require("../utils/connectDB");
require("dotenv").config();

connectDB();

async function seedOwner() {
  try {
    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("Owner already exists");
      return process.exit();
    }

    // Step 1: Create Admin User (without wallet)
    const admin = await User.create({
      email: "admin@123.com",
      password: "Admin@123", // plain for now (your User model hashes it)
      role: "admin",
    });

    // Step 2: Create Wallet and link it to Admin
    const wallet = await Wallet.create({
      userId: admin._id,
      balance: 1000, // Initial admin funds
      walletType: "main",
    });

    // Step 3: Link Wallet to Admin User
    admin.wallet = wallet._id;
    await admin.save();

    console.log("✅ Admin and wallet seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedOwner();
