const express = require('express');
const router = express.Router();
const Jackpot = require('../models/Jackpot');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get current jackpot status
router.get('/', async (req, res) => {
  try {
    let jackpot = await Jackpot.findOne().populate('lastWinner', 'username');
    if (!jackpot) jackpot = await new Jackpot().save();
    res.json(jackpot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contribute to jackpot (small % of each bet automatically goes here)
router.post('/contribute', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    let jackpot = await Jackpot.findOne();
    if (!jackpot) jackpot = new Jackpot();

    jackpot.currentAmount += amount;
    jackpot.contributions.push({ userId, amount });
    await jackpot.save();

    res.status(200).json({ message: 'Jackpot updated', jackpot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claim Jackpot (admin or logic based)
router.post('/claim', async (req, res) => {
  try {
    const { userId } = req.body;
    const jackpot = await Jackpot.findOne();
    if (!jackpot || jackpot.currentAmount === 0) return res.status(400).json({ error: 'Jackpot empty' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.walletBalance += jackpot.currentAmount;
    await user.save();

    await new Transaction({
      userId,
      type: 'jackpot',
      amount: jackpot.currentAmount,
      balanceAfter: user.walletBalance
    }).save();

    jackpot.lastWonAt = new Date();
    jackpot.lastWinner = userId;
    jackpot.currentAmount = 0;
    jackpot.contributions = [];
    await jackpot.save();

    res.status(200).json({ message: 'Jackpot claimed', winner: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
