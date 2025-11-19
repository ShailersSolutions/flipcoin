const express = require('express');
const router = express.Router();
const AdminStats = require('../models/AdminStats');
const FlipRound = require('../models/FlipRound');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Recalculate or get admin stats
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params; // format: YYYY-MM-DD
    let stats = await AdminStats.findOne({ date });

    if (!stats) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      const rounds = await FlipRound.find({ createdAt: { $gte: start, $lt: end } });
      const txs = await Transaction.find({ createdAt: { $gte: start, $lt: end } });

      let profit = 0;
      let maxBet = 0;
      const betCount = { Heads: 0, Tails: 0 };
      const userActivity = {};

      rounds.forEach(round => {
        profit += round.platformProfit || 0;
        betCount[round.resultSide] = (betCount[round.resultSide] || 0) + 1;
      });

      txs.forEach(tx => {
        if (tx.type === 'bet') {
          userActivity[tx.userId] = (userActivity[tx.userId] || 0) + tx.amount;
          if (tx.amount > maxBet) maxBet = tx.amount;
        }
      });

      const mostActiveUser = Object.entries(userActivity).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const mostBetSide = betCount.Heads > betCount.Tails ? 'Heads' : 'Tails';

      stats = new AdminStats({
        date,
        totalProfit: profit,
        totalRounds: rounds.length,
        mostBetSide,
        mostActiveUser,
        maxBet
      });
      await stats.save();
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

