const Transaction = require("../models/Transaction");

exports.getUserTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTransactionsById = async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "username email");
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
