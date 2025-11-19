
const Recharge = require("../models/Recharge");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// Get all pending recharge requests
exports.getAllPendingRecharges = async (req, res) => {
  try {
    const pending = await Recharge.find({ status: "pending" }).populate("userId", "username email").sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Admin approves recharge
exports.approveRecharge = async (req, res) => {
  try {
    const recharge = await Recharge.findById(req.params.id);
    if (!recharge || recharge.status !== "pending")
      return res.status(404).json({ error: "Recharge not found or already processed" });

    let wallet = await Wallet.findOne({ userId: recharge.userId._id || recharge.userId.toString() });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId: recharge.userId,
        balance: recharge.amount,
        lastTransactionAt: new Date(),
      });
    } else {
      wallet.balance += recharge.amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();
    }

    recharge.status = "approved";
    recharge.processedAt = new Date();
    await recharge.save();

    await Transaction.create({
      userId: recharge.userId,
      type: "topup",
      amount: recharge.amount,
      status: "success",
      source: "admin",
      balanceAfter: wallet.balance,
      referenceId: recharge._id,
      remark: "Admin approved recharge",
    });

    res.json({ message: "Recharge approved and wallet updated", balance: wallet.balance });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Admin rejects recharge
exports.rejectRecharge = async (req, res) => {
  try {
    const recharge = await Recharge.findById(req.params.id);
    if (!recharge || recharge.status !== "pending") return res.status(404).json({ error: "Recharge not found or already processed" });

    recharge.status = "rejected";
    recharge.processedAt = new Date();
    await recharge.save();

    res.json({ message: "Recharge request rejected" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};



// // Admin approves recharge (simple form)
// router.patch("/admin/recharge/:id", verifyToken, isAdmin, async (req, res) => {
//   const { status } = req.body;
//   if (!["approved", "rejected"].includes(status))
//     return res.status(400).json({ error: "Invalid status" });

//   const recharge = await Recharge.findById(req.params.id);
//   if (!recharge || recharge.status !== "pending")
//     return res.status(400).json({ error: "Invalid or already processed" });

//   recharge.status = status;
//   recharge.processedAt = new Date();
//   await recharge.save();

//   // ✅ Agar approve hai, toh wallet bhi update karo:
//   if (status === "approved") {
//     const wallet = await Wallet.findOne({ userId: recharge.userId });
//     wallet.balance += recharge.amount;
//     wallet.lastTransactionAt = new Date();
//     await wallet.save();

//     await Transaction.create({
//       userId: recharge.userId,
//       type: "topup",
//       amount: recharge.amount,
//       status: "success",
//       source: "admin",
//       balanceAfter: wallet.balance,
//       referenceId: recharge._id,
//       remark: "Admin approved recharge"
//     });
//   }

//   res.json({ message: `Recharge ${status} successfully.` });
// });
