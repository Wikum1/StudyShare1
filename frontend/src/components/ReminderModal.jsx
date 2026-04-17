import React, { useState, useEffect } from "react";
import reminderService from "../services/reminderService";
import "./ReminderModal.css";

/**
 * ReminderModal Component
 * Displays triggered reminders in a modal dialog
 * User can dismiss or view details
 */
export const ReminderModal = () => {
  const [reminders, setReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  useEffect(() => {
    // Fetch triggered reminders on component mount
    fetchReminders();

    // Poll for new reminders every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const triggered = await reminderService.getTriggeredReminders();
      if (triggered.length > 0) {
        setReminders(triggered);
        setIsOpen(true); // Auto-open modal if reminders exist
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const handleDismiss = async (reminderId) => {
    try {
      await reminderService.dismissReminder(reminderId);
      setReminders(reminders.filter((r) => r._id !== reminderId));

      // Close modal if no more reminders
      if (reminders.length === 1) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedReminder(null);
  };

  const handleViewDetails = (reminder) => {
    setSelectedReminder(reminder);
  };

  const handleBackToList = () => {
    setSelectedReminder(null);
  };

  if (!isOpen) return null;

  return (
    <div className="reminder-modal-overlay" onClick={handleCloseModal}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
        {selectedReminder ? (
          // Details View
          <div className="reminder-details-view">
            <button className="btn-back" onClick={handleBackToList}>
              ← Back
            </button>

            <div className="reminder-header">
              <h2>📚 {selectedReminder.title}</h2>
            </div>

            <div className="reminder-body">
              <div className="detail-row">
                <span className="label">Study Plan:</span>
                <span className="value">{selectedReminder.planTitle}</span>
              </div>

              <div className="detail-row">
                <span className="label">Task Date:</span>
                <span className="value">{selectedReminder.taskDate}</span>
              </div>

              <div className="detail-row">
                <span className="label">Task Time:</span>
                <span className="value">{selectedReminder.taskTime}</span>
              </div>

              <div className="detail-row">
                <span className="label">Reminder Triggered:</span>
                <span className="value">
                  {new Date(selectedReminder.reminderDateTime).toLocaleString()}
                </span>
              </div>

              <div className="info-box">
                <p>✅ Time to focus on your studies!</p>
              </div>
            </div>

            <div className="reminder-footer">
              <button
                className="btn-done"
                onClick={() => {
                  handleDismiss(selectedReminder._id);
                  handleBackToList();
                }}
              >
                Mark as Done
              </button>
              <button className="btn-cancel" onClick={handleBackToList}>
                Keep Reminder
              </button>
            </div>
          </div>
        ) : (
          // List View
          <div className="reminder-list-view">
            <div className="reminder-header">
              <h2>🔔 Study Reminders</h2>
              <p className="reminder-count">
                {reminders.length} reminder{reminders.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="reminder-items">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="reminder-item-card">
                  <div className="reminder-item-content">
                    <h3>{reminder.title}</h3>
                    <p className="plan-name">Plan: {reminder.planTitle}</p>
                    <p className="task-time">
                      {reminder.taskDate} • {reminder.taskTime}
                    </p>
                  </div>

                  <div className="reminder-item-actions">
                    <button
                      className="btn-details"
                      onClick={() => handleViewDetails(reminder)}
                    >
                      View
                    </button>
                    <button
                      className="btn-quick-dismiss"
                      onClick={() => handleDismiss(reminder._id)}
                      title="Mark as done"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="reminder-footer">
              <button className="btn-dismiss-all" onClick={handleCloseModal}>
                Dismiss & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderModal;
