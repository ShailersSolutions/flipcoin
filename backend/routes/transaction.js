const express = require("express");
const router = express.Router();
const txController = require("../controllers/transaction");

const { adminMiddleware } = require("../middlewares/admin");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/history", authMiddleware, txController.getUserTransactions);
router.get("/admin/:userId/history", adminMiddleware, txController.getUserTransactionsById);
router.get("/all-transactions", adminMiddleware, txController.getAllTransactions);

module.exports = router;
