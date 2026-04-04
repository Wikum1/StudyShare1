const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const profileController = require("../controllers/profile.controller");

// Authenticated profile routes
router.get("/me", protect, profileController.getMe);
router.put("/me", protect, profileController.updateMe);

module.exports = router;

