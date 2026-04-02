const Schedule = require("node-schedule");
const Task = require("../models/Task.model");
const StudyPlan = require("../models/StudyPlan.model");
const User = require("../models/User.model");
const reminderService = require("./reminderService");

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
      }).populate({
        path: "plan",
        populate: {
          path: "user"
        }
      });

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
      const taskId = task._id; // Store only the ID, not the full object

      // Cancel existing job if any
      if (this.jobs.has(jobId)) {
        this.jobs.get(jobId).cancel();
      }

      // Schedule the reminder
      const job = Schedule.scheduleJob(reminderTime, async () => {
        await this.triggerReminder(taskId);
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
   * Trigger the reminder - create an in-app reminder record
   * @param {String} taskId - Task ID to trigger reminder for
   */
  async triggerReminder(taskId) {
    try {
      // Fetch fresh task data with populated plan
      const task = await Task.findById(taskId).populate({
        path: "plan",
        populate: {
          path: "user"
        }
      });

      if (!task) {
        console.error(`Task not found: ${taskId}`);
        return;
      }

      console.log(`🔔 Triggering reminder for task: ${task.title}`);

      const plan = task.plan;
      
      if (!plan) {
        console.error(`Plan not found for task ${task._id}`);
        return;
      }

      const user = plan.user;
      if (!user) {
        console.error(`User not found for plan ${plan._id}`);
        return;
      }

      // Create in-app reminder record
      const reminder = await reminderService.createReminder(
        user._id,
        task._id,
        {
          title: task.title,
          date: task.date,
          time: task.time,
          reminderDateTime: task.reminderDateTime,
          planTitle: plan.title,
        }
      );

      // Mark reminder as sent in Task model
      task.reminderSent = true;
      await task.save();

      console.log(`✅ Reminder created for task: ${task.title}`);
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
