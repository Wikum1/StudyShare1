const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

// ============ AUTHENTICATED ROUTES ============
// Get all notifications for logged-in user
router.get("/", protect, notificationController.getNotifications);

// Mark notification as read
router.put("/:notificationId/read", protect, notificationController.markAsRead);

// Delete notification
router.delete("/:notificationId", protect, notificationController.deleteNotification);

module.exports = router;
