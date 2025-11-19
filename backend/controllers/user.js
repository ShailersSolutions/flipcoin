const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: "Avatar URL required" });
    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Optional - For showing stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("stats");
    res.json(user?.stats || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Optional - For showing referral code and who invited them
exports.getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("referralCode referredBy referralBonusClaimed");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
