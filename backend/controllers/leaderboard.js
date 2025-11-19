const UserScore = require("../models/UserScore");
const User = require("../models/User");

// GET /leaderboard/win-rate
exports.getTopByWinRate = async (req, res) => {
  try {
    const scores = await UserScore.find()
      .sort({ winRate: -1 })
      .limit(10)
      .populate("userId", "email avatar role");

    const result = scores.map(s => ({
      user: s.userId,
      winRate: s.winRate,
      totalRounds: s.totalRounds,
      mlRecommendedSide: s.mlRecommendedSide
    }));

    res.json({ leaderboard: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
};

// GET /leaderboard/risk
exports.getTopByRisk = async (req, res) => {
  try {
    const scores = await UserScore.find()
      .sort({ riskFactor: -1 })
      .limit(10)
      .populate("userId", "email avatar");

    const result = scores.map(s => ({
      user: s.userId,
      riskFactor: s.riskFactor,
      winRate: s.winRate,
      averageBet: s.averageBet
    }));

    res.json({ leaderboard: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
};
