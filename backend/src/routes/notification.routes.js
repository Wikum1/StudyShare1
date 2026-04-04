const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/me", protect, notificationController.getMyNotifications);
router.put("/me/read/:id", protect, notificationController.markNotificationRead);
router.put("/me/read", protect, notificationController.markAllRead);

module.exports = router;

