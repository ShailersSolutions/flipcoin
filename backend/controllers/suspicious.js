const express = require('express');
const router = express.Router();
const SuspiciousUser = require('../models/SuspiciousUser');
const User = require('../models/User');

// Get all suspicious users
router.get('/', async (req, res) => {
  try {
    const users = await SuspiciousUser.find().populate('userId', 'username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flag a user manually
router.post('/flag', async (req, res) => {
  try {
    const { userId, reason, notes } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const flagged = new SuspiciousUser({ userId, reason, notes });
    await flagged.save();

    res.status(201).json({ message: 'User flagged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as reviewed
router.put('/:id/review', async (req, res) => {
  try {
    const flagged = await SuspiciousUser.findByIdAndUpdate(
      req.params.id,
      { reviewed: true },
      { new: true }
    );
    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/adminAlerts.js
const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/auth");
const CoinFlip = require("../models/CoinFlip");
const User = require("../models/User");
const moment = require("moment");

// Helper to calculate suspicious win ratio or rapid flips
const isSuspicious = (wins, losses, flips, recentBets) => {
  const ratio = wins / (wins + losses);
  const winRateSuspicious = ratio > 0.9 && flips > 10;
  const frequentBetting = recentBets.filter(bet => bet < 5).length > 5;
  return winRateSuspicious || frequentBetting;
};

router.get("/alerts", adminMiddleware, async (req, res) => {
  try {
    const allUsers = await User.find();
    const flagged = [];

    for (const user of allUsers) {
      const flips = await CoinFlip.find({ userId: user._id }).sort({ createdAt: -1 });
      const total = flips.length;
      const wins = flips.filter(f => f.result === "win").length;
      const losses = flips.filter(f => f.result === "loss").length;
      const timestamps = flips.map(f => moment().diff(moment(f.createdAt), 'minutes'));

      if (isSuspicious(wins, losses, total, timestamps)) {
        flagged.push({
          username: user.username,
          userId: user._id,
          winRate: (wins / total).toFixed(2),
          flips: total,
          flaggedAt: new Date(),
          reason: wins / total > 0.9 ? "High win rate" : "Suspicious timing",
        });
      }
    }

    res.json({ alerts: flagged });
  } catch (err) {
    console.error("Admin alerts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
