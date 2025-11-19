const mongoose = require('mongoose');

const jackpotSchema = new mongoose.Schema({
  currentAmount: { type: Number, default: 0 },
  lastWonAt: { type: Date },
  lastWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contributions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: { type: Number },
      contributedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Jackpot', jackpotSchema);