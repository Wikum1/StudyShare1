const Schedule = require("node-schedule");
const Task = require("../models/Task.model");
const StudyPlan = require("../models/StudyPlan.model");
const User = require("../models/User.model");
const { sendWhatsAppReminder } = require("./whatsappService");

class ReminderScheduler {
  constructor() {
    this.jobs = new Map(); // Store scheduled jobs
    this.initialized = false;
  }

  /**
   * Initialize the reminder scheduler
   * Load all pending reminders from database and schedule them
   */
  async initialize() {
    try {
      console.log("🔔 Initializing Reminder Scheduler...");

      // Get all tasks with reminders that haven't been sent yet
      const tasksWithReminders = await Task.find({
        hasReminder: true,
        reminderSent: false
      }).populate("plan");

      console.log(`Found ${tasksWithReminders.length} pending reminders`);

      // Schedule each reminder
      for (const task of tasksWithReminders) {
        await this.scheduleReminder(task);
      }

      this.initialized = true;
      console.log("✅ Reminder Scheduler initialized");
    } catch (error) {
      console.error("❌ Error initializing Reminder Scheduler:", error);
    }
  }

  /**
   * Schedule a single reminder
   * @param {Object} task - Task object with reminderDateTime
   */
  async scheduleReminder(task) {
    try {
      if (!task.hasReminder || !task.reminderDateTime) {
        return;
      }

      const reminderTime = new Date(task.reminderDateTime);
      const now = new Date();

      // Skip if reminder time has already passed
      if (reminderTime <= now) {
        console.log(`⏭️  Skipping reminder for task ${task._id} - time has passed`);
        return;
      }

      const jobId = `task-${task._id}`;

      // Cancel existing job if any
      if (this.jobs.has(jobId)) {
        this.jobs.get(jobId).cancel();
      }

      // Schedule the reminder
      const job = Schedule.scheduleJob(reminderTime, async () => {
        await this.triggerReminder(task);
        this.jobs.delete(jobId);
      });

      this.jobs.set(jobId, job);

      const timeUntil = Math.round((reminderTime - now) / 1000); // seconds
      console.log(`📅 Reminder scheduled for task "${task.title}" in ${timeUntil} seconds`);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
    }
  }

  /**
   * Trigger the reminder - send WhatsApp message
   * @param {Object} task - Task object
   */
  async triggerReminder(task) {
    try {
      console.log(`🔔 Triggering reminder for task: ${task.title}`);

      // Get plan details
      const plan = await StudyPlan.findById(task.plan);
      const user = await User.findById(plan.userId);

      if (!user) {
        console.error(`User not found for task ${task._id}`);
        return;
      }

      const taskDetails = {
        title: task.title,
        date: task.date,
        time: task.time,
        planTitle: plan?.title || "Study Plan"
      };

      // Send WhatsApp
      if (user.phoneNumber) {
        const whatsappResult = await sendWhatsAppReminder(user.phoneNumber, taskDetails);
        if (whatsappResult.success) {
          console.log(`✅ WhatsApp message sent to ${user.phoneNumber}`);
        } else {
          console.log(`⚠️  WhatsApp send failed: ${whatsappResult.error}`);
        }
      } else {
        console.log(`⚠️  No phone number for WhatsApp notification`);
      }

      // Mark reminder as sent
      task.reminderSent = true;
      await task.save();

      console.log(`✅ Reminder completed for task: ${task.title}`);
    } catch (error) {
      console.error("Error triggering reminder:", error);
    }
  }

  /**
   * Add a new reminder when task is created
   * @param {Object} task - New task object
   */
  async addReminder(task) {
    if (task.hasReminder) {
      await this.scheduleReminder(task);
    }
  }

  /**
   * Update a reminder when task is updated
   * @param {Object} task - Updated task object
   */
  async updateReminder(task) {
    const jobId = `task-${task._id}`;

    // Cancel existing job
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId).cancel();
      this.jobs.delete(jobId);
      console.log(`⏹️  Cancelled reminder for task ${task._id}`);
    }

    // Schedule new reminder if still enabled
    if (task.hasReminder && !task.reminderSent) {
      await this.scheduleReminder(task);
    }
  }

  /**
   * Delete a reminder when task is deleted
   * @param {string} taskId - Task ID
   */
  async deleteReminder(taskId) {
    const jobId = `task-${taskId}`;

    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId).cancel();
      this.jobs.delete(jobId);
      console.log(`🗑️  Deleted reminder for task ${taskId}`);
    }
  }

  /**
   * Get all active reminders
   */
  getActiveReminders() {
    return Array.from(this.jobs.keys());
  }
}

// Export singleton instance
module.exports = new ReminderScheduler();
