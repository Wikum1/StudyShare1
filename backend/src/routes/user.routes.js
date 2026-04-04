const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// ============ AUTHENTICATED ROUTES FOR CURRENT USER ============
// Update current user profile
router.put("/profile/edit", protect, userController.updateUserProfile);

// ============ PUBLIC ROUTES ============
// Get any user profile by ID
router.get("/:userId", userController.getUserProfile);

// ============ AUTHENTICATED ROUTES ============
// Follow a user
router.post("/:userId/follow", protect, userController.followUser);

// Unfollow a user
router.delete("/:userId/follow", protect, userController.unfollowUser);

module.exports = router;
