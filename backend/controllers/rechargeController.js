const Recharge = require("../models/Recharge");
const Transaction = require("../models/Transaction");

// User requests a recharge
exports.requestRecharge = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const recharge = await Recharge.create({
      userId: req.user._id,
      amount,
      status: "pending",
      method: "UPI" // or whatever method you want
    });

    res.status(200).json({ message: "Recharge request submitted", recharge });
  } catch (err) {
    console.error("Recharge request error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// User sees their own pending recharge requests
exports.getPendingRecharges = async (req, res) => {
  try {
    const recharges = await Recharge.find({ userId: req.user._id, status: "pending" }).sort({ createdAt: -1 });
    res.json(recharges);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Optional: user can view all recharge history
exports.getRechargeHistory = async (req, res) => {
  try {
    const history = await Recharge.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
