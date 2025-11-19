const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { adminMiddleware } = require('../middlewares/admin');
const { pauseHandler, resumeHandler, overrideHandler } = require('../controllers/admin');

// Summary
// router.get('/summary', adminMiddleware, adminController.getAdminSummary);

// Analytics
router.get('/analytics', adminMiddleware, adminController.getAdminAnalytics);
router.get('/dashboard', adminMiddleware, adminController.getAdminDashboard);

// Chat Users
// router.get('/chat-users', adminMiddleware, adminController.getChatUsers);

// Chat History
// router.get('/chat-history/:roomId', adminMiddleware, adminController.getChatHistory);

// Daily Stats
router.get('/daily/:date', adminMiddleware, adminController.getDailyStats);

router.post("flip/pause", adminMiddleware, pauseHandler);
router.post("flip/resume", adminMiddleware, resumeHandler);
router.post("flip/override", adminMiddleware, overrideHandler);


module.exports = router;
