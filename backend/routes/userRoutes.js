// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/avatar", authMiddleware, userController.updateAvatar);

// Extra routes
router.get("/stats", authMiddleware, userController.getUserStats);
router.get("/referral", authMiddleware, userController.getReferralInfo);

module.exports = router;
