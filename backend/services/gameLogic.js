const FlipRound = require("../models/FlipRound");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

async function getSmartResult(round) {
  const freshRound = await FlipRound.findOne({ roundId: round.roundId });
  if (!freshRound) {
    console.log("❌ Round not found in DB");
    return null;
  }

  const heads = freshRound.totalHeadsBet || 0;
  const tails = freshRound.totalTailsBet || 0;

  if (heads === 0 && tails === 0) {
    console.log("⛔ No bets placed — skipping round");
    return null;
  }

  const risk = Math.random();
  const potentialPayout = Math.max(heads, tails) * 2;

  const adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    console.log("❌ No admin user found");
    return null;
  }

  const adminWallet = await Wallet.findOne({ userId: adminUser._id });

  console.log("💰 Heads:", heads, "| 🪙 Tails:", tails);
  console.log("🧮 Potential Payout:", potentialPayout);
  console.log("👑 Admin Balance:", adminWallet?.balance);

  if (!adminWallet || adminWallet.balance < potentialPayout) {
    console.log("⚠️ Admin wallet can't cover payout");
    return null;
  }

  const smartSide =
    risk > 0.2
      ? heads > tails ? "Tails" : "Heads"
      : Math.random() < 0.5 ? "Heads" : "Tails";

  console.log("✅ Smart Result Chosen:", smartSide);

  return { result: smartSide, risk };
}

module.exports = { getSmartResult };





// const FlipRound = require("../models/FlipRound");
// const Transaction = require("../models/Transaction");
// const User = require("../models/User");

// const MAX_PLATFORM_LOSS = 1000; // ⚠️ platform loss cap

// exports.resolveFlipRound = async (roundId, overrideResult = null, io = null) => {
//   const round = await FlipRound.findOne({ roundId });
//   if (!round || round.status !== "pending") return;

//   const admin = await User.findOne({ role: "admin" });
//   if (!admin) throw new Error("Admin wallet not found");

//   // Simulate loss on both sides
//   const simulateLoss = (side) => {
//     return round.participants.reduce((total, p) => {
//       return p.side === side ? total + (p.betAmount * 2) : total;
//     }, 0);
//   };

//   const headsLoss = simulateLoss("Heads");
//   const tailsLoss = simulateLoss("Tails");

//   // ❌ If both sides exceed platform loss cap
//   if (headsLoss > MAX_PLATFORM_LOSS && tailsLoss > MAX_PLATFORM_LOSS) {
//     for (const p of round.participants) {
//       const user = await User.findById(p.userId);
//       if (!user) continue;

//       user.walletBalance += p.betAmount;
//       p.result = "refund";

//       await user.save();

//       await Transaction.create({
//         userId: user._id,
//         type: "refund",
//         amount: p.betAmount,
//         roundId,
//         status: "cancelled"
//       });
//     }

//     round.status = "cancelled";
//     round.resultSide = null;
//     await round.save();

//     if (io) {
//       io.to(round.roundId).emit("round-cancelled", {
//         reason: "⚠️ Round cancelled due to technical imbalance. Bets refunded.",
//         roundId: round.roundId
//       });
//     }

//     return round;
//   }

//   // ✅ Otherwise, proceed with safe side
//   let resultSide = overrideResult;
//   if (!resultSide) {
//     resultSide = headsLoss < tailsLoss ? "Heads" : "Tails";
//   }

//   round.resultSide = resultSide;
//   round.status = "flipped";
//   round.flippedAt = new Date();
//   let profit = 0;

//   for (const p of round.participants) {
//     const user = await User.findById(p.userId);
//     if (!user) continue;

//     if (p.side === resultSide) {
//       const winAmount = p.betAmount * 2;
//       admin.walletBalance -= winAmount;
//       user.walletBalance += winAmount;

//       p.result = "win";
//       p.credited = true;

//       await Transaction.create({
//         userId: user._id,
//         type: "win",
//         amount: winAmount,
//         roundId,
//         status: "success",
//       });
//     } else {
//       profit += p.betAmount;
//       admin.walletBalance += p.betAmount;

//       p.result = "loss";

//       await Transaction.create({
//         userId: user._id,
//         type: "loss",
//         amount: p.betAmount,
//         roundId,
//         status: "success"
//       });
//     }

//     await user.save();
//   }

//   await admin.save();
//   round.platformProfit = profit;
//   await round.save();

//   if (io) {
//     io.to(round.roundId).emit("flipResult", { roundId, result: resultSide });
//   }

//   return round;
// };
