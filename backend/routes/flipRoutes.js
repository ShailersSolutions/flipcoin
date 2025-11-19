// routes/flipRound.js
const express = require("express");
const router = express.Router();
const flipController = require("../controllers/flipController");
const authMiddleware =require('../middlewares/authMiddleware')

// Flip round routes

router.post("/bet/:id", authMiddleware,flipController.placeBet);
// router.post("/resolve", flipController.resolveFlipRound);
router.get("/:roundId", authMiddleware, flipController.getRoundById);
// router.get('/stats/:userId', authMiddleware, flipController.getUserStats);
router.get('/leaderboard', authMiddleware,flipController.getLeaderboard);



module.exports = router;
