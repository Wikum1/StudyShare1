const API_BASE = process.env.REACT_APP_API_URL || "/api";

// Helper to get token from user object
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token;
  } catch (error) {
    return null;
  }
};

const reminderService = {
  /**
   * Initialize the reminder service
   * (Legacy method - kept for backwards compatibility)
   */
  async initialize() {
    // No-op for in-app reminder system
    return Promise.resolve();
  },

  /**
   * Schedule bulk reminders for tasks
   * (Legacy method - kept for backwards compatibility)
   * Reminders are now handled by the backend scheduler
   */
  scheduleBulkReminders(tasks, onReminder) {
    // No-op - backend handles all scheduling
    console.log("Bulk reminder scheduling handled by backend scheduler");
  },

  /**
   * Get all active reminders
   */
  async getReminders() {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reminders");
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching reminders:", error);
      return [];
    }
  },

  /**
   * Get reminders that should be shown now (isTriggered=true)
   */
  async getTriggeredReminders() {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/triggered`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch triggered reminders");
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching triggered reminders:", error);
      return [];
    }
  },

  /**
   * Get upcoming reminders (within 24 hours)
   */
  async getUpcomingReminders() {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/upcoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch upcoming reminders");
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error);
      return [];
    }
  },

  /**
   * Dismiss a reminder
   */
  async dismissReminder(reminderId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/${reminderId}/dismiss`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to dismiss reminder");
      return await response.json();
    } catch (error) {
      console.error("Error dismissing reminder:", error);
      throw error;
    }
  },

  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/${reminderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete reminder");
      return await response.json();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  },

  /**
   * Update reminder time
   */
  async updateReminderTime(reminderId, reminderDateTime) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/${reminderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminderDateTime }),
      });

      if (!response.ok) throw new Error("Failed to update reminder");
      return await response.json();
    } catch (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
  },

  /**
   * Get reminder statistics
   */
  async getReminderStats() {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/reminders/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {};
    }
  },
};

export default reminderService;
