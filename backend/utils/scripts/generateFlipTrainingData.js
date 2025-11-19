const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Flip = require("../models/Flip");
const Bet = require("../models/Bet");

const MONGO_URI = "mongodb+srv://team:NehaRani@cluster0.ilar1.mongodb.net/flipapp?retryWrites=true&w=majority"; // update this

async function generateTrainingData() {
  await mongoose.connect(MONGO_URI);

  const users = await Bet.distinct("userId");
  const rows = [["winRate", "averageBet", "totalRounds", "side"]];

  for (const userId of users) {
    const bets = await Bet.find({ userId });
    const flips = await Flip.find({ userId });

    const totalRounds = flips.length;
    const totalWins = flips.filter((f) => f.isWin).length;
    const winRate = totalRounds > 0 ? totalWins / totalRounds : 0;
    const avgBet =
      bets.reduce((sum, b) => sum + b.amount, 0) / Math.max(1, bets.length);

    const lastFlip = flips[flips.length - 1];
    if (lastFlip?.side) {
      rows.push([
        winRate.toFixed(2),
        avgBet.toFixed(2),
        totalRounds,
        lastFlip.side
      ]);
    }
  }

  const outputPath = path.join(__dirname, "../data/flips.csv");
  fs.writeFileSync(outputPath, rows.map((row) => row.join(",")).join("\n"));
  console.log("✅ Training data generated at:", outputPath);

  await mongoose.disconnect();
}

// Run the script
generateTrainingData();
