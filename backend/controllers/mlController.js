const axios = require("axios");
const UserScore = require("../models/UserScore");
const User = require("../models/User");
const Flip = require("../models/Flip");
const Bet = require("../models/Bet");

exports.fetchUserScore = async (req, res) => {
  try {
    const score = await UserScore.findOne({ userId: req.params.userId });
    if (!score) return res.status(404).json({ error: "Score not found" });
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateScoreManually = async (req, res) => {
  try {
    const { mlRecommendedSide, riskFactor, winRate, averageBet } = req.body;
    const score = await UserScore.findOneAndUpdate(
      { userId: req.params.userId },
      {
        mlRecommendedSide,
        riskFactor,
        winRate,
        averageBet,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMLRecommendation = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const totalFlips = await Flip.countDocuments({ userId });
    const totalWins = await Flip.countDocuments({ userId, result: "win" });
    const averageBet = await Bet.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$amount" } } },
    ]);
    const avgBet = averageBet[0]?.avg || 0;
    const winRate = totalWins / Math.max(totalFlips, 1);

    const mlRes = await axios.post("http://localhost:8000/predict", {
      winRate,
      averageBet: avgBet,
      totalRounds: totalFlips,
    });

    const { recommendedSide, riskFactor } = mlRes.data;

    const score = await UserScore.findOneAndUpdate(
      { userId },
      {
        mlRecommendedSide: recommendedSide,
        riskFactor,
        winRate,
        averageBet: avgBet,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ message: "ML score updated", score });
  } catch (err) {
    console.error("ML Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
