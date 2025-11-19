const mongoose = require('mongoose');

const adminStatsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  totalProfit: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 0 },
  mostBetSide: { type: String, enum: ['Heads', 'Tails'] },
  mostActiveUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maxBet: { type: Number, default: 0 }
});

module.exports = mongoose.model('AdminStats', adminStatsSchema);