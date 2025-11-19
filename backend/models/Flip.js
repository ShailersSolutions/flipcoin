const mongoose = require("mongoose");

const flipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bet: {
    type: Number,
    required: true,
  },
  side: {
    type: String,
    enum: ["Heads", "Tails"],
    required: true,
  },
  result: {
    type: String,
    enum: ["win", "loss"],
    required: true,
  },
  resultSide: {
    type: String,
    enum: ["Heads", "Tails"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flip", flipSchema);
