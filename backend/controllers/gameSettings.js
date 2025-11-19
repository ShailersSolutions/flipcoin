const express = require('express');
const router = express.Router();
const GameSetting = require('../models/GameSetting');

// Get current game settings
router.get('/', async (req, res) => {
  try {
    const setting = await GameSetting.findOne();
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update game settings (Admin only)
router.put('/', async (req, res) => {
  try {
    const { minBetAmount, maxBetAmount, roundDurationSec, platformFeePercent } = req.body;

    let setting = await GameSetting.findOne();
    if (!setting) setting = new GameSetting();

    setting.minBetAmount = minBetAmount;
    setting.maxBetAmount = maxBetAmount;
    setting.roundDurationSec = roundDurationSec;
    setting.platformFeePercent = platformFeePercent;
    setting.updatedAt = new Date();

    await setting.save();
    res.json({ message: 'Settings updated', setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
