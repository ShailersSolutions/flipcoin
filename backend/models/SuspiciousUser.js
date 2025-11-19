const mongoose = require('mongoose');

const suspiciousUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  flaggedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  notes: { type: String },
});

module.exports = mongoose.model('SuspiciousUser', suspiciousUserSchema);
