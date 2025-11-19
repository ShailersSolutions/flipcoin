const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: [
      "topup",
      "bet",
      "win",
      "loss",
      "referral",
      "withdrawal",
      "refund",
      "admin_adjustment",
      "platform-profit",
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
    // use positive numbers only, signed logic is in `type`
  },
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    default: "success"
  },
  balanceAfter: Number,
 referenceId: mongoose.Schema.Types.ObjectId ,// ✅ will point to Recharge._id
  isBonus: {
    type: Boolean,
    default: false
  },
  source: {
    type: String, // 'game', 'referral', 'admin', 'upi'
  },
  remark: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  deviceInfo: String
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
