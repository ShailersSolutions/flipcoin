const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  winStreak: { type: Number, default: 0 },
  avatar: { type: String },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  joinedAt: { type: Date, default: Date.now },
  pushToken: { type: String },

  referralCode: { type: String },
  referredBy: { type: String },
  referralBonusClaimed: { type: Boolean, default: false },

  notificationsEnabled: { type: Boolean, default: true },

  stats: {
    totalBets: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },

  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  blockedUntil: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
