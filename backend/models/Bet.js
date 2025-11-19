const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roundId: { type: mongoose.Schema.Types.ObjectId, ref: "FlipRound", required: true },
  amount: { type: Number, required: true },
  side: { type: String, enum: ["Heads", "Tails"], required: true },

  // 🧾 Gateway payment reference (if used)
  paymentId: { type: String },         // e.g., Razorpay/Stripe ID
  orderId: { type: String },           // optional if you generate an order

  // ✅ Status tracking
  status: {
    type: String,
    enum: ["pending", "confirmed", "failed", "refunded"],
    default: "confirmed", // if you're deducting wallet directly
  },

  placedAt: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bet", BetSchema);
