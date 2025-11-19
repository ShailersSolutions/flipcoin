const FlipRound = require("../models/FlipRound");
const User = require("../models/User");

// Get all participants of a round
exports.getParticipantsByRound = async (req, res) => {
  try {
    const round = await FlipRound.findOne({ roundId: req.params.roundId });
    if (!round) return res.status(404).json({ message: "Round not found" });

    res.json({ participants: round.participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all rounds participated by a user
exports.getRoundsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rounds = await FlipRound.find({
      "participants.userId": userId
    });

    const filtered = rounds.map((round) => {
      const userEntry = round.participants.find(p => p.userId.toString() === userId);
      return {
        roundId: round.roundId,
        resultSide: round.resultSide,
        userBet: userEntry.side,
        betAmount: userEntry.betAmount,
        result: userEntry.result,
        credited: userEntry.credited,
        flippedAt: round.flippedAt
      };
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get stats for a user’s participation
exports.getParticipantStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const rounds = await FlipRound.find({ "participants.userId": userId });

    let totalBets = 0, totalWins = 0, totalLosses = 0, totalAmount = 0;

    for (const round of rounds) {
      const p = round.participants.find(p => p.userId.toString() === userId);
      if (!p) continue;
      totalBets++;
      totalAmount += p.betAmount;
      if (p.result === "win") totalWins++;
      else totalLosses++;
    }

    res.json({
      userId,
      totalBets,
      totalWins,
      totalLosses,
      totalAmount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
