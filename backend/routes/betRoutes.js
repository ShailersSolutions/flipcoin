const express = require("express");
const router = express.Router();
const betController = require("../controllers/betController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/mybets",authMiddleware, betController.getBetsByUser);
router.get("/round/:roundId", betController.getBetsByRound);
router.get("/", betController.getFilteredBets); // filter with query params

module.exports = router;
