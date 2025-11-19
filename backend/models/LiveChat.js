const mongoose = require("mongoose");
const liveChatSchema = new mongoose.Schema({
  roundId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveChat', liveChatSchema);