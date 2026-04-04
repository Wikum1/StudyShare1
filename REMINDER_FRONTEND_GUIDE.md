# Reminder System - Frontend Integration Guide

## Quick Start

The frontend needs to fetch and display reminders to users. Here's how to integrate the reminder system.

---

## 1. Service Integration

Create or update `src/services/reminderService.js`:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || "/api";

const reminderService = {
  /**
   * Get all active reminders
   */
  async getReminders() {
    try {
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
```

---

## 2. Display Triggered Reminders

Add this to Dashboard home page or main layout:

### Example: ReminderNotification Component

```jsx
import React, { useState, useEffect } from "react";
import reminderService from "../services/reminderService";

export const ReminderNotification = () => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Fetch triggered reminders on component mount
    const fetchReminders = async () => {
      const triggered = await reminderService.getTriggeredReminders();
      setReminders(triggered);
    };

    fetchReminders();

    // Poll for new reminders every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (reminderId) => {
    try {
      await reminderService.dismissReminder(reminderId);
      setReminders(reminders.filter((r) => r._id !== reminderId));
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  };

  if (reminders.length === 0) return null;

  return (
    <div className="reminder-container">
      {reminders.map((reminder) => (
        <div key={reminder._id} className="reminder-notification">
          <div className="reminder-content">
            <h4>📚 Reminder: {reminder.title}</h4>
            <p>
              Plan: <strong>{reminder.planTitle}</strong>
            </p>
            <p>
              Task Time: {reminder.taskDate} at {reminder.taskTime}
            </p>
          </div>
          <div className="reminder-actions">
            <button
              onClick={() => handleDismiss(reminder._id)}
              className="btn-dismiss"
            >
              Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Example CSS

```css
.reminder-container {
  position: sticky;
  top: 20px;
  z-index: 1000;
  margin-bottom: 20px;
}

.reminder-notification {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.reminder-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.reminder-content p {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.95;
}

.reminder-actions {
  display: flex;
  gap: 8px;
}

.btn-dismiss {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 3. Upcoming Reminders Widget

Display in a sidebar or dedicated widget:

```jsx
import React, { useState, useEffect } from "react";
import reminderService from "../services/reminderService";

export const UpcomingReminders = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      const upcomingReminders = await reminderService.getUpcomingReminders();
      setUpcoming(upcomingReminders);
      setLoading(false);
    };

    fetchUpcoming();
  }, []);

  if (loading) return <div>Loading reminders...</div>;

  return (
    <div className="upcoming-reminders-widget">
      <h3>⏰ Next 24 Hours</h3>
      {upcoming.length === 0 ? (
        <p className="no-reminders">No upcoming reminders</p>
      ) : (
        <ul className="reminder-list">
          {upcoming.map((reminder) => (
            <li key={reminder._id} className="reminder-item">
              <div>
                <strong>{reminder.title}</strong>
                <br />
                <small>{reminder.taskDate} at {reminder.taskTime}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 4. Reminder Stats

Show reminder overview:

```jsx
import React, { useState, useEffect } from "react";
import reminderService from "../services/reminderService";

export const ReminderStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    triggered: 0,
    dismissed: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await reminderService.getReminderStats();
      setStats(data);
    };

    fetchStats();
  }, []);

  return (
    <div className="reminder-stats">
      <div className="stat-card">
        <span className="stat-number">{stats.active}</span>
        <span className="stat-label">Active</span>
      </div>
      <div className="stat-card">
        <span className="stat-number">{stats.triggered}</span>
        <span className="stat-label">Triggered</span>
      </div>
      <div className="stat-card">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
    </div>
  );
};
```

---

## 5. Integration Points

### In `DashboardHome.jsx`:

```jsx
import { ReminderNotification } from "../components/ReminderNotification";
import { UpcomingReminders } from "../components/UpcomingReminders";

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      <ReminderNotification /> {/* Show triggered reminders */}
      
      <div className="dashboard-grid">
        <main>
          {/* Main dashboard content */}
        </main>
        <aside>
          <UpcomingReminders /> {/* Show next 24h reminders */}
        </aside>
      </div>
    </div>
  );
}
```

### On Task Creation:

```jsx
const handleCreateTask = async (taskData) => {
  // ...create task with hasReminder and reminderDateTime
  
  const task = await studyPlanService.createTask({
    title: taskData.title,
    date: taskData.date,
    time: taskData.time,
    hasReminder: taskData.hasReminder,
    reminderDateTime: taskData.reminderDateTime, // ISO string
    // ...other fields
  });

  // Reminder is automatically scheduled by backend
  console.log("✅ Task created with reminder scheduled");
};
```

---

## 6. Task Form Enhancement

Add reminder fields to task creation form:

```jsx
import React, { useState } from "react";

export const TaskForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    hasReminder: false,
    reminderDateTime: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to ISO string if reminder is enabled
    const data = {
      ...formData,
      reminderDateTime: formData.hasReminder
        ? new Date(
            `${formData.date}T${formData.time}:00`
          ).toISOString()
        : null,
    };
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        required
      />

      <label>
        <input
          type="checkbox"
          name="hasReminder"
          checked={formData.hasReminder}
          onChange={handleChange}
        />
        Set Reminder
      </label>

      {formData.hasReminder && (
        <div>
          <label>Reminder Time (before task)</label>
          <input
            type="datetime-local"
            name="reminderDateTime"
            value={formData.reminderDateTime}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <button type="submit">Create Task</button>
    </form>
  );
};
```

---

## Implementation Checklist

- ✅ Create `reminderService.js`
- ✅ Add `ReminderNotification` component
- ✅ Add `UpcomingReminders` widget
- ✅ Integrate into Dashboard
- ✅ Add reminder fields to TaskForm
- ✅ Style reminder notifications
- ✅ Add polling for new reminders
- ✅ Test reminder dismissal
- ✅ Test reminder creation and triggering

---

## Testing the System

```bash
# Start backend
cd backend
npm start

# Start frontend
cd frontend
npm start

# Create a task with reminder
# Set reminderDateTime to 5 minutes from now
# Wait for reminder to trigger and appear on dashboard
```

---

## Notes

- Reminders use browser localStorage for token, ensure HTTPS in production
- Poll interval (5 minutes) can be adjusted in `ReminderNotification`
- All times are in ISO 8601 format (UTC)
- Frontend should handle timezone conversion if needed
