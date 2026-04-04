import React, { useState, useEffect, useRef } from "react";
import reminderService from "../services/reminderService";
import "./ReminderToast.css";

/**
 * ReminderToast Component
 * Simple, reliable notification system for reminders
 */
export const ReminderToast = () => {
  const [toasts, setToasts] = useState([]);
  const dismissedRemindersRef = useRef(new Set());

  useEffect(() => {
    console.log("🚀 ReminderToast component mounted");
    
    // Check immediately on mount
    checkReminders();

    // Check every 10 seconds
    const interval = setInterval(checkReminders, 10 * 1000);
    console.log("⏱️  Reminder check interval set to 10 seconds");

    return () => {
      clearInterval(interval);
      console.log("🛑 ReminderToast component unmounted");
    };
  }, []);

  const checkReminders = async () => {
    try {
      // Get token from user object
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.log("❌ No user found - user not logged in");
        return;
      }

      const user = JSON.parse(userStr);
      const token = user?.token;
      
      if (!token) {
        console.log("❌ No token found in user object");
        return;
      }

      console.log("🔍 Checking for triggered reminders...");
      const triggered = await reminderService.getTriggeredReminders();
      console.log(`✅ Found ${triggered.length} triggered reminders`);

      // Show toast for each new triggered reminder
      triggered.forEach((reminder) => {
        // Only show if we haven't already dismissed this one
        if (!dismissedRemindersRef.current.has(reminder._id)) {
          console.log("🎉 New reminder detected:", reminder.title);
          showToast(reminder);
          dismissedRemindersRef.current.add(reminder._id);
        } else {
          console.log("⏭️  Already showed reminder:", reminder.title);
        }
      });
    } catch (error) {
      console.error("❌ Error checking reminders:", error);
    }
  };

  const showToast = (reminder) => {
    const toastId = Date.now() + Math.random();

    const toast = {
      id: toastId,
      reminderId: reminder._id,
      title: reminder.title,
      planTitle: reminder.planTitle,
      taskTime: reminder.taskTime,
      taskDate: reminder.taskDate,
    };

    console.log("🔔 Showing reminder toast:", reminder.title);
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after 12 seconds
    setTimeout(() => removeToast(toastId), 12000);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleDismiss = async (toastId, reminderId) => {
    removeToast(toastId);

    try {
      // Also dismiss in backend
      await reminderService.dismissReminder(reminderId);
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <div className="toast-inner">
            <div className="toast-icon">📚</div>
            <div className="toast-body">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-subtitle">{toast.planTitle}</div>
              <div className="toast-time">
                📅 {toast.taskDate} • 🕐 {toast.taskTime}
              </div>
            </div>
            <div className="toast-actions">
              <button
                className="toast-btn"
                onClick={() => handleDismiss(toast.id, toast.reminderId)}
                title="Dismiss"
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderToast;

