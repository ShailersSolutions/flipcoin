const Bet = require("../models/Bet");
const User = require("../models/User");

// ✅ Get all bets by a specific user
exports.getBetsByUser = async (req, res) => {
  try {
    const  userId  = req.user.id;
    const bets = await Bet.find({ userId }).sort({ placedAt: -1 });
    const totalBets = await Bet.countDocuments({ userId });

    if (!bets.length) {
      return res.status(404).json({ message: "No bets found for this user." });
    }

    res.json({bets:bets, totalBets: totalBets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all bets for a specific round
exports.getBetsByRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const bets = await Bet.find({ roundId }).sort({ placedAt: 1 });

    if (!bets.length) {
      return res.status(404).json({ message: "No bets found for this round." });
    }

    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all bets with optional filters (userId, roundId, date range)
exports.getFilteredBets = async (req, res) => {
  try {
    const { userId, roundId, startDate, endDate } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (roundId) filter.roundId = roundId;
    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) filter.placedAt.$gte = new Date(startDate);
      if (endDate) filter.placedAt.$lte = new Date(endDate);
    }

    const bets = await Bet.find(filter).sort({ placedAt: -1 });

    if (!bets.length) {
      return res.status(404).json({ message: "No bets match the criteria." });
    }

    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
