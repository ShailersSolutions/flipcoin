const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String },
  betAmount: { type: Number, required: true },
  side: { type: String, enum: ['Heads', 'Tails'], required: true },
  result: { type: String, enum: ['win', 'loss'], default: 'loss' },
  credited: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
ipAddress: { type: String },
deviceInfo: { type: String },

});

const flipRoundSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true },
  participants: [participantSchema],
  resultSide: { type: String, enum: ['Heads', 'Tails'] },
  status: { type: String, enum: ['pending', 'flipped','cancelled'], default: 'pending' },
  flippedAt: { type: Date },
  cancelledReason: { type: String, default: null }, // ✅ NEW
  platformProfit: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  totalHeadsBet: { type: Number, default: 0 },
  totalTailsBet: { type: Number, default: 0 },
  adminNotes: { type: String, default: "" },
  resultHash: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('FlipRound', flipRoundSchema);