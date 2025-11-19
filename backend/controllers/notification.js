const Notification = require("../models/Notification");

// 🧾 Get notifications for logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ visibleTo: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, visibleTo: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧑‍💼 Admin: Create and broadcast a new notification
exports.createAndBroadcastNotification = async (req, res) => {
  try {
    const { message, type, body, roundId, visibleTo } = req.body;

    const notification = new Notification({
      message,
      type,
      body,
      roundId,
      visibleTo,
    });

    await notification.save();

    // Optional: also send push notifications here
    // You can call sendNotification.js here if needed

    res.status(201).json({ message: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Admin: View all notifications (optional)
exports.getAllNotifications = async (req, res) => {
  try {
    const all = await Notification.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// // routes/push.js
// const express = require("express");
// const router = express.Router();
// const { authMiddleware } = require("../middleware/auth");
// const User = require("../models/User");
// const axios = require("axios");

// // Save push token
// router.post("/user/push-token", authMiddleware, async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token) return res.status(400).json({ message: "Token required" });
//     await User.findByIdAndUpdate(req.user.id, { pushToken: token });
//     res.json({ message: "Token saved" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Admin trigger notification
// router.post("/admin/send-notification", async (req, res) => {
//   try {
//     const { title, body } = req.body;
//     const users = await User.find({ pushToken: { $ne: null } });

//     const messages = users.map((u) => ({
//       to: u.pushToken,
//       sound: "default",
//       title,
//       body,
//     }));

//     const chunks = []; // split if too many
//     while (messages.length) chunks.push(messages.splice(0, 100));

//     for (const batch of chunks) {
//       await axios.post("https://exp.host/--/api/v2/push/send", batch, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }

//     res.json({ message: "Notifications sent" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // Get all notifications for user
// exports.getUserNotifications = async (req, res) => {
//   const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
//   res.json(notifications);
// };

// // Mark one notification as read
// exports.markAsRead = async (req, res) => {
//   const { id } = req.params;
//   await Notification.findByIdAndUpdate(id, { read: true });
//   res.json({ success: true });
// };

// module.exports = router;
