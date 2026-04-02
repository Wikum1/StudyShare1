const Reminder = require("../models/Reminder.model");
const Task = require("../models/Task.model");
const StudyPlan = require("../models/StudyPlan.model");

/**
 * Create a reminder for a task
 */
const createReminder = async (userId, taskId, taskData) => {
  try {
    const reminder = new Reminder({
      task: taskId,
      user: userId,
      title: taskData.title,
      reminderDateTime: taskData.reminderDateTime,
      taskDate: taskData.date,
      taskTime: taskData.time,
      planTitle: taskData.planTitle,
    });

    await reminder.save();
    console.log(`✅ Reminder created for task: ${taskData.title}`);
    return reminder;
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

/**
 * Get all active (non-triggered) reminders for a user
 */
const getActiveReminders = async (userId) => {
  try {
    const reminders = await Reminder.find({
      user: userId,
      isTriggered: false,
      isDismissed: false,
    })
      .sort({ reminderDateTime: 1 })
      .populate("task");

    return reminders;
  } catch (error) {
    console.error("Error fetching active reminders:", error);
    return [];
  }
};

/**
 * Get upcoming reminders (within next 24 hours)
 */
const getUpcomingReminders = async (userId) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: userId,
      reminderDateTime: { $gte: now, $lte: tomorrow },
      isTriggered: false,
      isDismissed: false,
    })
      .sort({ reminderDateTime: 1 })
      .populate("task");

    return reminders;
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error);
    return [];
  }
};

/**
 * Check if any reminders should be triggered
 */
const checkAndTriggerReminders = async (userId) => {
  try {
    const now = new Date();

    const reminders = await Reminder.find({
      user: userId,
      reminderDateTime: { $lte: now },
      isTriggered: false,
      isDismissed: false,
    });

    for (const reminder of reminders) {
      reminder.isTriggered = true;
      await reminder.save();
      console.log(`⏰ Reminder triggered: ${reminder.title}`);
    }

    return reminders;
  } catch (error) {
    console.error("Error checking reminders:", error);
    return [];
  }
};

/**
 * Dismiss a reminder
 */
const dismissReminder = async (reminderId, userId) => {
  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      throw new Error("Reminder not found");
    }

    // Verify ownership
    if (reminder.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    reminder.isDismissed = true;
    await reminder.save();

    console.log(`✅ Reminder dismissed: ${reminder.title}`);
    return reminder;
  } catch (error) {
    console.error("Error dismissing reminder:", error);
    throw error;
  }
};

/**
 * Delete a reminder
 */
const deleteReminder = async (reminderId, userId) => {
  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      throw new Error("Reminder not found");
    }

    // Verify ownership
    if (reminder.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    await Reminder.findByIdAndDelete(reminderId);
    console.log(`🗑️  Reminder deleted`);
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

/**
 * Update reminder datetime
 */
const updateReminderTime = async (reminderId, userId, newDateTime) => {
  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      throw new Error("Reminder not found");
    }

    // Verify ownership
    if (reminder.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    reminder.reminderDateTime = new Date(newDateTime);
    reminder.isTriggered = false;
    await reminder.save();

    console.log(`✏️  Reminder updated`);
    return reminder;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

/**
 * Get reminder statistics for user
 */
const getReminderStats = async (userId) => {
  try {
    const total = await Reminder.countDocuments({ user: userId });
    const active = await Reminder.countDocuments({
      user: userId,
      isTriggered: false,
      isDismissed: false,
    });
    const triggered = await Reminder.countDocuments({
      user: userId,
      isTriggered: true,
      isDismissed: false,
    });
    const dismissed = await Reminder.countDocuments({
      user: userId,
      isDismissed: true,
    });

    return {
      total,
      active,
      triggered,
      dismissed,
    };
  } catch (error) {
    console.error("Error getting reminder stats:", error);
    return { total: 0, active: 0, triggered: 0, dismissed: 0 };
  }
};

module.exports = {
  createReminder,
  getActiveReminders,
  getUpcomingReminders,
  checkAndTriggerReminders,
  dismissReminder,
  deleteReminder,
  updateReminderTime,
  getReminderStats,
};
