const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const { protect } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(protect);

/**
 * Get all active reminders for the user
 * GET /api/reminders
 */
router.get("/", reminderController.getReminders);

/**
 * Get triggered reminders (notifications that should be shown)
 * GET /api/reminders/triggered
 */
router.get("/triggered", reminderController.getTriggeredReminders);

/**
 * Get upcoming reminders (within 24 hours)
 * GET /api/reminders/upcoming
 */
router.get("/upcoming", reminderController.getUpcomingReminders);

/**
 * Get reminder statistics
 * GET /api/reminders/stats
 */
router.get("/stats", reminderController.getReminderStats);

/**
 * Dismiss a reminder
 * PUT /api/reminders/:reminderId/dismiss
 */
router.put("/:reminderId/dismiss", reminderController.dismissReminder);

/**
 * Update reminder datetime
 * PUT /api/reminders/:reminderId
 */
router.put("/:reminderId", reminderController.updateReminderTime);

/**
 * Delete a reminder
 * DELETE /api/reminders/:reminderId
 */
router.delete("/:reminderId", reminderController.deleteReminder);

module.exports = router;
