const FlipRound = require("../models/FlipRound");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Bet = require("../models/Bet");
const Wallet = require("../models/Wallet");


let io;

exports.setSocketIOInstance = (ioInstance) => {
  io = ioInstance;
};

// ✅ PLACE BET — Active only when round is pending

exports.placeBet = async (req, res) => {
  try {
    const { betAmount, side } = req.body;
    const parsedAmount = parseInt(betAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
  return res.status(400).json({ error: "Invalid bet amount" });
}

    const userId = req.user.id;
    const roundId = req.params.id;

    if (!parsedAmount || !side)
      return res.status(400).json({ error: "Missing required fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet || wallet.balance < parsedAmount)
      return res.status(400).json({ error: "Insufficient wallet balance" });
    

    const round = await FlipRound.findOne({ roundId });

    if (!round || round.status !== "pending")
      return res.status(400).json({ error: "Invalid or closed round" });

    const timeLeft = (new Date(round.endsAt).getTime() - Date.now()) / 1000;
    if (timeLeft <= 0)
      return res.status(400).json({ error: "Betting time ended" });

    // Prevent duplicate bet in same round
    const alreadyJoined = round.participants.some(p => p.userId.toString() === userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: "Already placed bet in this round" });
    }

    // Deduct balance
    wallet.balance -= parsedAmount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();
     console.log("🪙 Adding participant:", {
  userId, betAmount: parsedAmount, side
});
console.log("Total Heads:", round.totalHeadsBet);
console.log("Total Tails:", round.totalTailsBet);
console.log("side",side)


    round.participants.push({
      userId,
      username: user.username,
      betAmount:parsedAmount,
      side,
    });

 
    round.totalParticipants++;
  
// 🧮 Add to totals
if (side === "Heads") {
  round.totalHeadsBet += parsedAmount;
} else if (side === "Tails") {
  round.totalTailsBet += parsedAmount;
}

// Debug log
console.log("🪙 Added:", { side, parsedAmount });
console.log("Updated Totals -> Heads:", round.totalHeadsBet, "Tails:", round.totalTailsBet);

    await round.save();
    await Bet.create({ userId, roundId: round._id, amount: parsedAmount, side });

    await Transaction.create({
      userId,
      type: "bet",
      amount: parsedAmount,
      roundId,
      balanceAfter: wallet.balance,
      status: "success",
    });

    // Realtime emit
    if (io) {
      io.emit("joinedUpdate", {
        roundId: round.roundId,
        joined: round.totalParticipants,
        participants: round.participants.map(p => ({
          userId: p.userId,
          username: p.username,
          side: p.side,
        })),
      });
    }

    res.json({ message: "Bet placed successfully", roundId: round.roundId });

  } catch (err) {
    console.error("Bet error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET USER STATS
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const rounds = await FlipRound.find({ "participants.userId": userId });

    let totalRounds = 0,
      wins = 0,
      losses = 0,
      totalSpent = 0,
      totalEarned = 0;

    for (let r of rounds) {
      for (let p of r.participants) {
        if (p.userId.toString() === userId) {
          totalRounds++;
          totalSpent += p.betAmount;
          if (p.result === "win") {
            wins++;
            totalEarned += p.betAmount * 2;
          } else losses++;
        }
      }
    }

    res.json({ totalRounds, wins, losses, totalSpent, totalEarned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ROUND BY ID
exports.getRoundById = async (req, res) => {
  try {
    const round = await FlipRound.findOne({ roundId: req.params.roundId });
    if (!round) return res.status(404).json({ error: "Round not found" });
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const rounds = await FlipRound.find();
    const statsMap = new Map();

    for (const round of rounds) {
      for (const p of round.participants) {
        if (!statsMap.has(p.userId)) {
          statsMap.set(p.userId, { wins: 0, totalBet: 0, username: p.username });
        }
        const userStats = statsMap.get(p.userId);
        userStats.totalBet += p.betAmount;
        if (p.result === "win") userStats.wins++;
      }
    }

    const leaderboard = Array.from(statsMap.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// // controllers/flipRoundController.js
// const axios = require("axios");
// const { v4: uuidv4 } = require("uuid");
// const FlipRound = require("../models/FlipRound");
// const Transaction = require("../models/Transaction");
// const User = require("../models/User");
// let io;




// exports.setSocketIOInstance = (ioInstance) => {
//   io = ioInstance;
// };

// exports.startNewFlipRound = async (req, res) => {
//   try {
//     const { duration } = req.body; // in seconds
//     const roundId = uuidv4();
//     const endsAt = new Date(Date.now() + duration * 1000);
//     const round = new FlipRound({ roundId, endsAt });
//     await round.save();

//     // Push notifications (optional)
//     const users = await User.find({ pushToken: { $ne: null }, notificationsEnabled: true });
//     const messages = users.map((u) => ({
//       to: u.pushToken,
//       sound: "default",
//       title: "🎯 New Flip Round Started",
//       body: "Place your bets now!"
//     }));

//     while (messages.length) {
//       const batch = messages.splice(0, 100);
//       await axios.post("https://exp.host/--/api/v2/push/send", batch, {
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Emit socket event
//     if (io) io.emit("round-started", { roundId, endsAt });

//     // Schedule resolution
//     setTimeout(() => resolveRoundInternal(roundId), duration * 1000);

//     res.status(201).json({ message: "New round started", round });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.placeBet = async (req, res) => {
//   try {
//     const { roundId, userId, betAmount, side } = req.body;
//     const user = await User.findById(userId);
//     if (!user || user.walletBalance < betAmount) {
//       return res.status(400).json({ error: "Insufficient balance" });
//     }

//     const round = await FlipRound.findOne({ roundId });
//     if (!round || round.status !== "pending") {
//       return res.status(400).json({ error: "Invalid or closed round" });
//     }

//     user.walletBalance -= betAmount;
//     await user.save();

//     round.participants.push({
//       userId,
//       username: user.username,
//       betAmount,
//       side
//     });

//     round.totalParticipants++;
//     side === "Heads"
//       ? (round.totalHeadsBet += betAmount)
//       : (round.totalTailsBet += betAmount);

//     await round.save();

//     // ✅ Save individual bet in Bet collection
//     await new Bet({
//       userId,
//       roundId,
//       amount: betAmount,
//       side
//     }).save();

//     await new Transaction({
//       userId,
//       type: "bet",
//       amount: betAmount,
//       roundId,
//       balanceAfter: user.walletBalance,
//       status: "success"
//     }).save();

//     if (io) io.to(roundId).emit("bet-placed", round);

//     res.json({ message: "Bet placed successfully" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const resolveRoundInternal = async (roundId) => {         resolveFlipRound()	⚠️ Optional	Only if you want manual override
//   try {
//     const round = await FlipRound.findOne({ roundId });
//     if (!round || round.status !== "pending") return;

//     // 1. Calculate total bet on each side
//     let headsTotal = 0;
//     let tailsTotal = 0;

//     for (const p of round.participants) {
//       if (p.side === "Heads") headsTotal += p.betAmount;
//       else if (p.side === "Tails") tailsTotal += p.betAmount;
//     }

//     // 2. Smart result decision with casino logic
//     let resultSide;
//     const risk = Math.random(); // 0 to 1

//     if (risk > 0.2) {
//       // 🔒 80% chance: minimize platform loss
//       resultSide = headsTotal > tailsTotal ? "Tails" : "Heads";
//     } else {
//       // 🎲 20% chance: pick randomly to look fair
//       resultSide = Math.random() < 0.5 ? "Heads" : "Tails";
//     }

//     // 3. Mark round flipped
//     round.resultSide = resultSide;
//     round.status = "flipped";
//     round.flippedAt = new Date();
//     let platformProfit = 0;

//     // 4. Settle all participant bets
//     for (const p of round.participants) {
//       if (p.side === resultSide) {
//         const winAmount = p.betAmount * 2;
//         await User.findByIdAndUpdate(p.userId, {
//           $inc: { walletBalance: winAmount },
//         });

//         p.result = "win";
//         p.credited = true;

//         await new Transaction({
//           userId: p.userId,
//           type: "win",
//           amount: winAmount,
//           roundId,
//           status: "success",
//         }).save();
//       } else {
//         p.result = "loss";
//         platformProfit += p.betAmount;
//       }
//     }

//     round.platformProfit = platformProfit;
//     await round.save();

//     // 5. Emit result via socket
//     if (io) io.to(roundId).emit("round-resolved", { roundId, resultSide });

//   } catch (err) {
//     console.error("Round resolve error:", err.message);
//   }
// };

// exports.resolveFlipRound = async (req, res) => {
//   try {
//     const { roundId, resultSide } = req.body;
//     const round = await FlipRound.findOne({ roundId });
//     if (!round || round.status !== "pending") {
//       return res.status(400).json({ error: "Invalid round" });
//     }

//     round.resultSide = resultSide;
//     round.status = "flipped";
//     round.flippedAt = new Date();
//     let profit = 0;

//     for (const p of round.participants) {
//       if (p.side === resultSide) {
//         const winAmount = p.betAmount * 2;
//         await User.findByIdAndUpdate(p.userId, { $inc: { walletBalance: winAmount } });
//         p.result = "win";
//         p.credited = true;

//         await new Transaction({
//           userId: p.userId,
//           type: "win",
//           amount: winAmount,
//           roundId,
//           status: "success"
//         }).save();
//       } else {
//         p.result = "loss";
//         profit += p.betAmount;
//       }
//     }

//     round.platformProfit = profit;
//     await round.save();

//     if (io) io.to(roundId).emit("round-resolved", { roundId, resultSide });

//     res.json({ message: "Round resolved", round });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getUserStats = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const rounds = await FlipRound.find({ "participants.userId": userId });
//     let totalRounds = 0, wins = 0, losses = 0, totalSpent = 0, totalEarned = 0;

//     for (let r of rounds) {
//       for (let p of r.participants) {
//         if (p.userId.toString() === userId) {
//           totalRounds++;
//           totalSpent += p.betAmount;
//           if (p.result === "win") {
//             wins++;
//             totalEarned += p.betAmount * 2;
//           } else losses++;
//         }
//       }
//     }

//     res.json({ totalRounds, wins, losses, totalSpent, totalEarned });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.getRoundById = async (req, res) => {
//   try {
//     const round = await FlipRound.findOne({ roundId: req.params.roundId });
//     if (!round) return res.status(404).json({ error: "Round not found" });
//     res.json(round);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getLeaderboard = async (req, res) => {
//   try {
//     const rounds = await FlipRound.find();
//     const statsMap = new Map();

//     for (const round of rounds) {
//       for (const p of round.participants) {
//         if (!statsMap.has(p.userId)) {
//           statsMap.set(p.userId, { wins: 0, totalBet: 0, username: p.username });
//         }
//         const userStats = statsMap.get(p.userId);
//         userStats.totalBet += p.betAmount;
//         if (p.result === "win") userStats.wins++;
//       }
//     }

//     const leaderboard = Array.from(statsMap.entries())
//       .map(([userId, stats]) => ({ userId, ...stats }))
//       .sort((a, b) => b.wins - a.wins)
//       .slice(0, 10);

//     res.json(leaderboard);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
