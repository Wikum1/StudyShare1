const reminderService = require("../services/reminderService");

/**
 * Get all active reminders for the logged-in user
 */
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await reminderService.getActiveReminders(userId);

    res.status(200).json({
      success: true,
      message: "Reminders fetched successfully",
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("Error in getReminders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reminders",
      error: error.message,
    });
  }
};

/**
 * Get triggered (active notification) reminders for user
 */
exports.getTriggeredReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await reminderService.checkAndTriggerReminders(userId);

    res.status(200).json({
      success: true,
      message: "Triggered reminders fetched",
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("Error in getTriggeredReminders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching triggered reminders",
      error: error.message,
    });
  }
};

/**
 * Get upcoming reminders (within 24 hours)
 */
exports.getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await reminderService.getUpcomingReminders(userId);

    res.status(200).json({
      success: true,
      message: "Upcoming reminders fetched",
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("Error in getUpcomingReminders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming reminders",
      error: error.message,
    });
  }
};

/**
 * Dismiss a reminder (mark as dismissed)
 */
exports.dismissReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.id;

    const reminder = await reminderService.dismissReminder(reminderId, userId);

    res.status(200).json({
      success: true,
      message: "Reminder dismissed successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Error in dismissReminder:", error);

    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to dismiss this reminder",
      });
    }

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error dismissing reminder",
      error: error.message,
    });
  }
};

/**
 * Delete a reminder
 */
exports.deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.id;

    await reminderService.deleteReminder(reminderId, userId);

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteReminder:", error);

    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this reminder",
      });
    }

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting reminder",
      error: error.message,
    });
  }
};

/**
 * Update reminder datetime
 */
exports.updateReminderTime = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { reminderDateTime } = req.body;
    const userId = req.user.id;

    if (!reminderDateTime) {
      return res.status(400).json({
        success: false,
        message: "reminderDateTime is required",
      });
    }

    const reminder = await reminderService.updateReminderTime(
      reminderId,
      userId,
      reminderDateTime
    );

    res.status(200).json({
      success: true,
      message: "Reminder time updated successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Error in updateReminderTime:", error);

    if (error.message === "Unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this reminder",
      });
    }

    if (error.message === "Reminder not found") {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating reminder",
      error: error.message,
    });
  }
};

/**
 * Get reminder statistics
 */
exports.getReminderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await reminderService.getReminderStats(userId);

    res.status(200).json({
      success: true,
      message: "Reminder statistics fetched",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getReminderStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
