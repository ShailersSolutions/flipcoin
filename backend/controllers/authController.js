const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username,
      email,
      password, // ✅ Don't hash manually — handled by pre-save hook
      referralCode: shortid.generate(),
      referredBy: referralCode || null,
    });

    await newUser.save(); // ✅ Save user first to get _id

    const wallet = new Wallet({
      userId: newUser._id,
      balance: 0,
    });
    await wallet.save();

    newUser.wallet = wallet._id;
    await newUser.save();

    // ✅ Referral Logic
    if (referralCode) {
      const inviter = await User.findOne({ referralCode });

      if (inviter) {
        newUser.referralBonusClaimed = true;
        await newUser.save();

        // Inviter: Update stats + wallet + transaction
        inviter.stats.totalEarned += 30;
        await inviter.save();

        const inviterWallet = await Wallet.findOne({ userId: inviter._id });
        if (inviterWallet) {
          inviterWallet.balance += 30;
          await inviterWallet.save();

          await Transaction.create({
            userId: inviter._id,
            type: "referral",
            amount: 30,
            status: "success",
            balanceAfter: inviterWallet.balance,
            source: "referral",
            remark: `Referral bonus for inviting ${newUser.email}`,
            referenceId: newUser._id,
          });
        }

        // New User Wallet
        wallet.balance += 20;
        await wallet.save();

        await Transaction.create({
          userId: newUser._id,
          type: "referral",
          amount: 20,
          status: "success",
          balanceAfter: wallet.balance,
          source: "referral",
          remark: `Referral bonus for using code ${referralCode}`,
          referenceId: inviter._id,
          isBonus: true,
        });
      }
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
        walletId: wallet._id,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fixed Admin Login
    if (email === "admin@123.com" && password === "Admin@123") {
      let existingAdmin = await User.findOne({ email });

      if (!existingAdmin) {
        const adminUser = new User({
          email,
          password, // ✅ Let pre-save hook hash it
          role: "admin",
          username: "Admin",
        });
        await adminUser.save();

        existingAdmin = adminUser;
      }

      const token = generateToken(existingAdmin);
      return res.json({
        token,
        role: "admin",
        userId: existingAdmin._id,
      });
    }

    // Normal User Login
    const user = await User.findOne({ email }).populate("wallet");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.blockedUntil && user.blockedUntil > new Date()) {
      return res.status(403).json({ message: "User temporarily blocked" });
    }

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        walletBalance: user.wallet?.balance || 0,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
