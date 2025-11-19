const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet");


const authMiddleware = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/admin");

router.post("/topup", authMiddleware, walletController.topUpRequest);
router.post("/topup/:id/approve", adminMiddleware, walletController.approveTopUp);

router.post("/withdraw", authMiddleware, walletController.requestWithdrawal);
router.post("/withdraw/:id/decision", adminMiddleware, walletController.decideWithdrawal);

router.post("/refund", adminMiddleware, walletController.manualRefund);
router.get("/balance", authMiddleware, walletController.getWalletBalance);


module.exports = router;
