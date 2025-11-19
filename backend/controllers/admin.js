const FlipRound = require('../models/FlipRound');
const User = require('../models/User');
const Transaction = require('../models/Transaction');


const { pauseFlipRounds, resumeFlipRounds, overrideResult } = require("../services/flipRoomManager");
// Get Admin Summary Dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRounds = await FlipRound.countDocuments();
    const ongoingRounds = await FlipRound.countDocuments({ status: 'pending' });

    const topUser = await User.findOne().sort({ 'stats.totalEarned': -1 }).limit(1);

    res.json({
      totalUsers,
      totalRounds,
      ongoingRounds,
      topUser: topUser ? {
        email: topUser.email,
        balance: topUser.walletBalance,
        earnings: topUser.stats.totalEarned
      } : null
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
};

// Analytics for Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalRounds = await FlipRound.countDocuments();
    const completedRounds = await FlipRound.countDocuments({ status: 'flipped' });
    const totalProfit = await FlipRound.aggregate([
      { $match: { status: 'flipped' } },
      { $group: { _id: null, total: { $sum: '$platformProfit' } } }
    ]);

    const resultDistribution = await FlipRound.aggregate([
      { $match: { status: 'flipped' } },
      { $group: { _id: '$resultSide', count: { $sum: 1 } } }
    ]);

    const topRounds = await FlipRound.find({ status: 'flipped' })
      .sort({ platformProfit: -1 })
      .limit(5);

    res.json({
      totalRounds,
      completedRounds,
      totalProfit: totalProfit[0]?.total || 0,
      resultDistribution,
      topRounds
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ error: 'Analytics generation failed' });
  }
};

// Daily Stats per Date
exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const rounds = await FlipRound.find({ createdAt: { $gte: start, $lt: end } });

    let profit = 0, maxBet = 0;
    const betCount = { Heads: 0, Tails: 0 };
    const userActivity = {};

    for (const round of rounds) {
      profit += round.platformProfit;
      if (round.resultSide) {
        betCount[round.resultSide] = (betCount[round.resultSide] || 0) + 1;
      }

      for (const p of round.participants) {
        userActivity[p.userId] = (userActivity[p.userId] || 0) + p.betAmount;
        if (p.betAmount > maxBet) maxBet = p.betAmount;
      }
    }

    const mostActiveUser = Object.entries(userActivity)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const mostBetSide = betCount.Heads > betCount.Tails ? 'Heads' : 'Tails';

    res.json({
      date,
      totalProfit: profit,
      totalRounds: rounds.length,
      mostBetSide,
      mostActiveUser,
      maxBet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.pauseHandler = (req, res) => {
  try {
    pauseFlipRounds();
    res.json({ message: "Game loop paused" });
  } catch (err) {
    res.status(500).json({ error: "Failed to pause flip rounds" });
  }
};

exports.resumeHandler = (req, res) => {
  try {
    resumeFlipRounds();
    res.json({ message: "Game loop resumed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resume flip rounds" });
  }
};

exports.overrideHandler = (req, res) => {
  try {
    const { result } = req.body;
    if (!["Heads", "Tails"].includes(result)) {
      return res.status(400).json({ message: "Invalid result value" });
    }

    overrideResult(result);
    res.json({ message: `Next round will use manual result: ${result}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to override flip result" });
  }
};
