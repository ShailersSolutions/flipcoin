const mongoose = require("mongoose");

const userScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  
  winRate: { type: Number, default: 0 },
  averageBet: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 0 },

  mlRecommendedSide: { type: String, enum: ["Heads", "Tails", null], default: null },
  riskFactor: { type: Number, default: 0 }, // 0 to 1
  
  confidence: { type: Number, default: 0 }, // New: How confident ML model is (0–1)
  lastResult: { type: String },             // win/loss for last game
  streak: { type: Number, default: 0 },     // win/loss streak count
  trend: { type: String, enum: ["up", "down", "flat"], default: "flat" }, // win trend
  modelVersion: { type: String, default: "v1" },  // for versioning ML

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserScore", userScoreSchema);
