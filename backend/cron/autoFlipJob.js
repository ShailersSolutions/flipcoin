// cron/autoFlipJob.js
const cron = require("node-cron");
const FlipSession = require("../models/FlipSession");
const User = require("../models/User");

const runAutoFlip = async () => {
  const now = new Date();
  const sessions = await FlipSession.find({
    startTime: { $lte: now },
    status: "pending",
  }).populate("participants.userId");

  for (const session of sessions) {
    session.status = "flipping";
    const flipResult = Math.random() < 0.5 ? "Heads" : "Tails";
    session.flipResult = flipResult;
    session.endTime = new Date();

    for (const p of session.participants) {
      if (p.sideChosen === flipResult) {
        p.result = "win";
        const user = p.userId;
        user.wallet += p.amount * 2;
        user.totalWinnings += p.amount;
        await user.save();
      } else {
        p.result = "loss";
      }
    }
await sendWinEmail(user.email, p.amount, flipResult);
await sendExpoPush(user.expoPushToken, `You won ₹${p.amount * 2} on ${flipResult}!`);

    session.status = "completed";
    await session.save();
    console.log(`Session ${session._id} auto-completed with ${flipResult}`);
  }
};

// Run every 1 minute
cron.schedule("*/1 * * * *", async () => {
  try {
    await runAutoFlip();
  } catch (err) {
    console.error("Auto-flip error:", err);
  }
});
