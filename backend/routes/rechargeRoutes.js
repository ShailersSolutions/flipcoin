const express = require("express");
const router = express.Router();
const { requestRecharge, getPendingRecharges, getRechargeHistory } = require("../controllers/rechargeController");
const { approveRecharge, rejectRecharge, getAllPendingRecharges } = require("../controllers/adminRechargeController");
const authMiddleware = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/admin");


// === 🧍‍♂️ USER ROUTES ===

// Request recharge
router.post("/request", authMiddleware, requestRecharge);

// Get user's pending recharge requests
router.get("/pending", authMiddleware, getPendingRecharges);

// Get user's recharge history (optional if needed)
router.get("/history", authMiddleware, getRechargeHistory);


// === 🛡️ ADMIN ROUTES ===

// Get all pending recharge requests
router.get("/allUsers/pending", authMiddleware, adminMiddleware, getAllPendingRecharges);

// Approve recharge
router.post("/:id/approve", authMiddleware, adminMiddleware, approveRecharge);

// Reject recharge
router.post("/:id/reject", authMiddleware, adminMiddleware, rejectRecharge);


module.exports = router;
