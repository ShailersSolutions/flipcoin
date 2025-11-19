const express = require('express');
const router = express.Router();
const LiveChat = require('../models/LiveChat');
const User = require('../models/User');

// Get latest messages (limit to last 50)
router.get('/', async (req, res) => {
  try {
    const messages = await LiveChat.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'username');
    res.json(messages.reverse()); // to show oldest first
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const msg = new LiveChat({ userId, message });
    await msg.save();

    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
