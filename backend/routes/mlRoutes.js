const express = require("express");
const router = express.Router();
const {
  fetchUserScore,
  updateScoreManually,
  getMLRecommendation
} = require("../controllers/mlController");

router.get("/:userId", fetchUserScore);
router.put("/:userId", updateScoreManually);
router.post("/predict/:userId", getMLRecommendation); // or GET if no body is used

module.exports = router;
