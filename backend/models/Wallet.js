const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  lockedBalance: {
    type: Number,
    default: 0
  },
  walletType: {
    type: String,
    enum: ['main', 'bonus', 'winnings'],
    default: 'main'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastTransactionAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
