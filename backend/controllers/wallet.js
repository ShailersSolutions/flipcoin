const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/withdrawal");

const getWallet = async (userId) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};

exports.topUpRequest = async (req, res) => {
  try {
    const { amount, upiRef } = req.body;
    if (!amount || !upiRef) return res.status(400).json({ message: "Missing fields" });

    const wallet = await getWallet(req.user.id);
    await Transaction.create({
      userId: req.user.id,
      type: "topup",
      amount,
      balanceAfter: wallet.balance,
      status: "pending",
      metadata: { upiRef },
    });

    res.status(200).json({ message: "Top-up request submitted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveTopUp = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx || tx.type !== "topup" || tx.status !== "pending")
      return res.status(404).json({ message: "Pending top-up not found" });

    const wallet = await getWallet(tx.userId);
    wallet.balance += tx.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    tx.status = "success";
    tx.balanceAfter = wallet.balance;
    await tx.save();

    res.status(200).json({ message: "Top-up approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    if (!amount || !upiId) return res.status(400).json({ message: "Missing fields" });

    const wallet = await getWallet(req.user.id);
    if (wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await Withdrawal.create({ userId: req.user.id, amount, upiId });
    await Transaction.create({
      userId: req.user.id,
      type: "withdrawal",
      amount,
      status: "pending",
      metadata: { upiId },
    });

    res.status(201).json({ message: "Withdrawal requested" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.decideWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return res.status(404).json({ message: "Not found" });

    const wallet = await getWallet(withdrawal.userId);
    withdrawal.status = status;

    if (status === "rejected") {
      wallet.balance += withdrawal.amount;
      await Transaction.create({
        userId: withdrawal.userId,
        type: "refund",
        amount: withdrawal.amount,
        status: "success",
        metadata: { reason },
      });
    }

    if (status === "approved") {
      await Transaction.create({
        userId: withdrawal.userId,
        type: "withdrawal",
        amount: withdrawal.amount,
        status: "success",
        metadata: { approved: true },
      });
    }

    wallet.lastTransactionAt = new Date();
    await wallet.save();
    await withdrawal.save();

    res.json({ message: `Withdrawal ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.manualRefund = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    const wallet = await getWallet(userId);
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await Transaction.create({
      userId,
      type: "refund",
      amount,
      balanceAfter: wallet.balance,
      status: "success",
      metadata: { reason },
    });

    res.status(200).json({ message: "Refund issued" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency,
      lastTransactionAt: wallet.lastTransactionAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
