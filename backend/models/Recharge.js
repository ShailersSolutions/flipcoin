// models/Recharge.js
const mongoose = require("mongoose");

const rechargeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  mode: {
    type: String,
    enum: ["upi", "bank", "card", "manual"],
    default: "upi",
  },
  screenshotUrl: String, // optional if user uploads proof
  adminNote: String,
}, { timestamps: true });

module.exports = mongoose.model("Recharge", rechargeSchema);
