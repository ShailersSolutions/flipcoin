const FlipRound = require("../models/FlipRound");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { getSmartResult } = require("./gameLogic");

let currentRound = null;
let countdown = 60;
let interval = null;
let isPaused = false;
let isProcessing = false;

function startGameLoop(io) {
  createNewRound(io);

  interval = setInterval(async () => {
    if (isPaused || !currentRound || isProcessing) return;

    io.emit("timer", countdown);

    if (countdown <= 0) {
      isProcessing = true;
      countdown = 0;

      const smart = await getSmartResult(currentRound);

      if (!smart) {
        await handleCancelledRound(io);
        await createNewRound(io);
        isProcessing = false;
        return;
      }

      const { result, risk } = smart;

      await flipCoinAndCloseRound(io, result, risk);
      await delay(10000); // delay before new round
      await createNewRound(io);
      isProcessing = false;
      return;
    }

    countdown--;
  }, 1000);
}

async function handleCancelledRound(io) {
  const round = await FlipRound.findOne({ roundId: currentRound?.roundId });
  if (!round) return;

  round.status = "cancelled";
  round.cancelledReason = "Insufficient admin balance or unfair bet mismatch";
  await round.save();

  for (const p of round.participants) {
    const user = await User.findById(p.userId);
    const wallet = await Wallet.findOne({ userId: user?._id });

    if (wallet) {
      wallet.balance += p.betAmount;
      await wallet.save();

      await Transaction.create({
        userId: user._id,
        amount: p.betAmount,
        type: "refund",
        status: "success",
        metadata: {
          reason: round.cancelledReason,
          roundId: round.roundId,
        },
      });
    }
  }
  

  io.emit("roundCancelled", { reason: round.cancelledReason });
}

async function createNewRound(io) {
  const roundId = `round_${Date.now()}`;
  const endsAt = new Date(Date.now() + 60 * 1000);

  const newRound = await FlipRound.create({
    roundId,
    endsAt,
    status: "pending",
  });

  currentRound = newRound;
  countdown = 60;

  io.emit("newRound", {
    roundId: newRound.roundId,
    time: countdown,
    joined: newRound.totalParticipants || 0,
    participants: [],
  });
}

async function flipCoinAndCloseRound(io, result, risk) {
  const round = await FlipRound.findOne({ roundId: currentRound?.roundId });
  if (!round) return;

  const adminUser = await User.findOne({ role: "admin" });
  const adminWallet = await Wallet.findOne({ userId: adminUser?._id });

  round.resultSide = result;
  round.status = "flipped";
  round.flippedAt = new Date();
  round.resultHash = `Risk: ${risk?.toFixed(2)} | SmartResult: ${result}`;

  let profit = 0;

  for (const p of round.participants) {
    const user = await User.findById(p.userId);
    const wallet = await Wallet.findOne({ userId: user?._id });
    const amount = p.betAmount;

    if (!user || !wallet) continue;

    if (p.side === result) {
      wallet.balance += amount * 2;

      await Transaction.create({
        userId: user._id,
        amount,
        type: "win",
        status: "success",
        metadata: {
          roundId: round.roundId,
        },
      });

      p.result = "win";
      p.credited = true;
    } else {
      await Transaction.create({
        userId: user._id,
        amount,
        type: "loss",
        status: "success",
        metadata: {
          roundId: round.roundId,
        },
      });

      p.result = "loss";
      profit += amount;
    }

    wallet.lastTransactionAt = new Date();
    await wallet.save();
  }

  if (profit > 0 && adminWallet) {
    adminWallet.balance += profit;
    adminWallet.lastTransactionAt = new Date();
    await adminWallet.save();

    await Transaction.create({
      userId: adminUser._id,
      amount: profit,
      type: "platform-profit",
      status: "success",
      metadata: {
        roundId: round.roundId,
        source: "Round profit from losing bets",
      },
    });
  }

  round.platformProfit = profit;
  await round.save();
  io.emit("flipResult", { result, roundId: round.roundId });


  

  console.log("✅ Round closed with result:", result);
  console.log("🧾 Platform Profit Credited:", profit);
  console.log("💼 Final Admin Wallet Balance:", adminWallet?.balance || "Unknown");
}

function getCurrentRound() {
  return currentRound;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { startGameLoop, getCurrentRound };





// const FlipRound = require("../models/FlipRound");
// const { resolveFlipRound } = require("./gameLogic");

// let currentRound = null;
// let countdown = 60;
// let interval = null;
// let isPaused = false;
// let manualOverrideResult = null;

// function startGameLoop(io) {
//   createNewRound(io);
//   interval = setInterval(async () => {
//     if (isPaused || !currentRound) return;

//     countdown--;
//     io.to(currentRound.roundId).emit("timer", countdown);

//     if (countdown <= 0) {
//       await resolveFlipRound(currentRound.roundId, manualOverrideResult, io);
//       manualOverrideResult = null;
//       await createNewRound(io);
//     }
//   }, 1000);
// }

// async function createNewRound(io) {
//   const roundId = `round_${Date.now()}`;
//   const endsAt = new Date(Date.now() + 60 * 1000);

//   const newRound = await FlipRound.create({
//     roundId,
//     endsAt,
//     status: "pending",
//     participants: [],
//   });

//   currentRound = newRound;
//   countdown = 60;
//   io.emit("newRound", { roundId: newRound.roundId, time: countdown });
// }

// function pauseFlipRounds() {
//   isPaused = true;
// }
// function resumeFlipRounds() {
//   isPaused = false;
// }
// function overrideResult(result) {
//   if (["Heads", "Tails"].includes(result)) {
//     manualOverrideResult = result;
//   }
// }

// module.exports = {
//   startGameLoop,
//   pauseFlipRounds,
//   resumeFlipRounds,
//   overrideResult,
// };
