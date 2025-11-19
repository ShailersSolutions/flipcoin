


// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const flipRoundRoutes = require("./routes/flipRoutes");
const mlRoutes = require("./routes/mlRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./utils/connectDB");
const notificationRoutes = require('./routes/notificationRoutes');
const participantsRoutes=require('./routes/participantRoutes')
const authRoutes=require('./routes/authRoutes')
const betRoutes=require('./routes/betRoutes')
const userRoutes=require('./routes/userRoutes')
const walletRoutes=require('./routes/wallet')
const transationRoutes=require('./routes/transaction')
const { startGameLoop,getCurrentRound } = require("./services/flipRoomManager");
const rechargeRoutes=require('./routes/rechargeRoutes');
const { setSocketIOInstance } = require("./controllers/flipController");

connectDB();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust for security in prod
    methods: ["GET", "POST"],
  },
});

setSocketIOInstance(io);

startGameLoop(io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Send current round if exists
  const current = getCurrentRound();
  if (current && current.status === "pending") {
    const timeLeft = Math.floor((new Date(current.endsAt).getTime() - Date.now()) / 1000);
    socket.emit("newRound", {
      roundId: current.roundId,
      time: timeLeft,
      joined: current.totalParticipants || 0,
      participants: current.participants.map(p => ({
        userId: p.userId,
        username: p.username,
        side: p.side
      }))
    });
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



// Middleware
app.use(cors());
app.use(express.json());



// Routes
app.use("/api/flip-round", flipRoundRoutes);


app.use("/api/ml", mlRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/auth',authRoutes)
// app.use('/api/notifications',notificationRoutes)
// app.use('/api/participants',participantsRoutes)
app.use('/api/bet',betRoutes)
app.use('/api/user',userRoutes)
app.use('/api/wallet',walletRoutes)
app.use('/api/transaction',transationRoutes)
app.use('/api/recharge',rechargeRoutes)



// Server listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

