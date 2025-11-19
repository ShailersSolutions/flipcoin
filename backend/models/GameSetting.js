const mongoose = require('mongoose');

const gameSettingSchema = new mongoose.Schema({
  minBetAmount: { type: Number, default: 10 },
  maxBetAmount: { type: Number, default: 10000 },
  roundDurationSec: { type: Number, default: 30 }, // duration before auto flip
  platformFeePercent: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSetting', gameSettingSchema);
