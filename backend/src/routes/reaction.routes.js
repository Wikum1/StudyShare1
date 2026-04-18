const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reaction.controller");
const { protect } = require("../middleware/auth.middleware");

// ============ PUBLIC ROUTES ============
// Get reactions for post or comment
router.get("/", reactionController.getReactions);

// ============ AUTHENTICATED ROUTES ============
// Get user's reactions (MUST BE BEFORE :reactionId route)
router.get("/user/my-reactions", protect, reactionController.getUserReactions);

// Add reaction to post or comment
router.post("/", protect, reactionController.addReaction);

// Remove reaction
router.delete("/:reactionId", protect, reactionController.removeReaction);

module.exports = router;
