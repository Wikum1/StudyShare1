// reminderService.js
// This service manages reminder notifications and schedules

class ReminderService {
  constructor() {
    this.activeReminders = new Map(); // Store active reminder timeouts
    this.checkInterval = null;
  }

  /**
   * Initialize the reminder service
   * Requests notification permission if not already granted
   */
  async initialize() {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Failed to request notification permission:", error);
      }
    }
  }

  /**
   * Send a browser notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  sendNotification(title, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "📚",
          badge: "📚",
          tag: options.tag || "reminder",
          requireInteraction: true,
          ...options,
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        return notification;
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    }
  }

  /**
   * Schedule a reminder for a task
   * @param {Object} task - Task object with reminderDateTime
   * @param {Function} onReminder - Callback when reminder fires
   * @returns {string} Reminder ID
   */
  scheduleReminder(task, onReminder) {
    const reminderId = task._id;

    // Clear any existing reminder for this task
    if (this.activeReminders.has(reminderId)) {
      clearTimeout(this.activeReminders.get(reminderId));
    }

    const reminderTime = new Date(task.reminderDateTime).getTime();
    const currentTime = Date.now();
    const timeUntilReminder = reminderTime - currentTime;

    if (timeUntilReminder > 0) {
      const timeoutId = setTimeout(() => {
        this.sendNotification(`📚 Task Reminder: ${task.title}`, {
          body: `Your task "${task.title}" is scheduled for ${this.formatTime(new Date(task.date + " " + task.time))}`,
          tag: `reminder-${reminderId}`,
        });

        if (onReminder) {
          onReminder(task);
        }

        // Remove from active reminders
        this.activeReminders.delete(reminderId);
      }, timeUntilReminder);

      this.activeReminders.set(reminderId, timeoutId);
      return reminderId;
    }

    return null;
  }

  /**
   * Schedule reminders for multiple tasks
   * @param {Array} tasks - Array of task objects
   * @param {Function} onReminder - Callback when reminder fires
   */
  scheduleBulkReminders(tasks, onReminder) {
    tasks.forEach((task) => {
      if (task.hasReminder && task.reminderDateTime) {
        this.scheduleReminder(task, onReminder);
      }
    });
  }

  /**
   * Cancel a specific reminder
   * @param {string} reminderId - Task ID
   */
  cancelReminder(reminderId) {
    if (this.activeReminders.has(reminderId)) {
      clearTimeout(this.activeReminders.get(reminderId));
      this.activeReminders.delete(reminderId);
    }
  }

  /**
   * Cancel all active reminders
   */
  cancelAllReminders() {
    this.activeReminders.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.activeReminders.clear();
  }

  /**
   * Get count of active reminders
   */
  getActiveRemindersCount() {
    return this.activeReminders.size;
  }

  /**
   * Format time for notification
   * @param {Date} dateTime - Date and time to format
   * @returns {string} Formatted time string
   */
  formatTime(dateTime) {
    return dateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  /**
   * Get reminders that are coming up soon (within next hour)
   * @param {Array} tasks - Array of task objects
   * @returns {Array} Array of tasks with reminders soon
   */
  getUpcomingReminders(tasks) {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;

    return tasks.filter((task) => {
      if (!task.hasReminder || !task.reminderDateTime) {
        return false;
      }

      const reminderTime = new Date(task.reminderDateTime).getTime();
      return reminderTime >= now && reminderTime <= oneHourFromNow;
    });
  }

  /**
   * Check if a reminder has already passed
   * @param {Object} task - Task object
   * @returns {boolean} True if reminder time has passed
   */
  hasReminderPassed(task) {
    if (!task.hasReminder || !task.reminderDateTime) {
      return false;
    }

    return new Date(task.reminderDateTime).getTime() < Date.now();
  }
}

// Create singleton instance
const reminderService = new ReminderService();

export default reminderService;
