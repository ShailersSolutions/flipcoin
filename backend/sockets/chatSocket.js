// backend/sockets/chatSocket.js
const ChatMessage = require("../models/ChatMessage");

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected to chat socket");

    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
    });

    socket.on("sendMessage", async ({ room, msg }) => {
        // Add inside socket.on("sendMessage", ...)
if (msg.sender === 'admin') {
  io.to(room).emit('notify', { message: 'New message from admin' });
} else {
  // Notify admin globally or to a dashboard room
  io.to('admin-dashboard').emit('notify', { message: `New message from ${room}` });
}

      // Save message
      await ChatMessage.create({ roomId: room, ...msg });
      io.to(room).emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected from chat socket");
    });
  });
}

module.exports = chatSocket;
