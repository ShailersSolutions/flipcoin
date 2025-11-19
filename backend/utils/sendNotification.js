const axios = require("axios");
const Notification = require("../models/Notification");
const User = require("../models/User");

const sendNotification = async ({ message, type = "info", body = "", roundId = null, visibleTo = [] }) => {
  try {
    // Save in DB
    const notification = new Notification({
      message,
      type,
      body,
      roundId,
      visibleTo,
    });
    await notification.save();

    // Send push notifications (Expo)
    const users = await User.find({ _id: { $in: visibleTo }, pushToken: { $ne: null } });

    const messages = users.map(user => ({
      to: user.pushToken,
      sound: "default",
      title: message,
      body,
    }));

    const chunks = [];
    while (messages.length) chunks.push(messages.splice(0, 100));

    for (const batch of chunks) {
      await axios.post("https://exp.host/--/api/v2/push/send", batch, {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("🔔 Notification sent and saved");
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
};

module.exports = sendNotification;
