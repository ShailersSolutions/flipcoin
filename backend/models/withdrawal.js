const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  netAmount: {
    type: Number
  },
  fee: {
    type: Number,
    default: 0
  },
  upiId: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ["upi", "bank", "paytm"],
    default: "upi"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  txnRef: String, // UPI/Bank ref no
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  reason: String, // Rejection reason
  isAutoProcessed: {
    type: Boolean,
    default: false
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
