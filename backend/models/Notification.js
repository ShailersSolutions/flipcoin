
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'bonus', 'system'], default: 'info' },
  roundId: { type: String },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  body: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
