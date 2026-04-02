import React, { useState } from "react";
import "../pages/TaskDetailsModal.css";

function TaskDetailsModal({
  isOpen,
  tasks,
  selectedDate,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) {
  if (!isOpen) return null;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return d.toLocaleDateString("en-US", options);
  };

  const formatReminderDateTime = (reminderDateTime) => {
    try {
      if (!reminderDateTime) return "N/A";
      const dateObj = new Date(reminderDateTime);
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return dateObj.toLocaleString();
    } catch (e) {
      console.error("Error formatting reminder date:", e);
      return "Invalid date";
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = parseInt(a.time.replace(":", ""));
    const timeB = parseInt(b.time.replace(":", ""));
    return timeA - timeB;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Tasks for {formatDateDisplay(selectedDate)}</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {sortedTasks.length === 0 ? (
            <div className="no-tasks-message">
              <p>No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {sortedTasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-card ${task.status === "completed" ? "completed" : ""} ${
                    task.isImportant ? "important" : ""
                  }`}
                >
                  <div className="task-card-header">
                    <div className="task-time-title">
                      <span className="task-time">
                        🕐 {task.time}
                      </span>
                      <h3 className="task-title">{task.title}</h3>
                    </div>
                    <div className="task-card-badges">
                      {task.isImportant && (
                        <span className="badge important-badge">⭐ Important</span>
                      )}
                      {task.hasReminder && (
                        <span className="badge reminder-badge">🔔 Reminder at {formatReminderDateTime(task.reminderDateTime)}</span>
                      )}
                    </div>
                  </div>

                  <div className="task-card-body">
                    <div className="task-status">
                      Status: <strong>{task.status === "completed" ? "✅ Completed" : "⏳ Pending"}</strong>
                    </div>
                    <div className="task-plan">
                      Plan: <strong>{task.planTitle}</strong>
                    </div>
                  </div>

                  <div className="task-card-actions">
                    <button
                      className={`btn-status ${task.status === "completed" ? "completed" : ""}`}
                      onClick={() => onToggleTask(task)}
                      title={task.status === "completed" ? "Mark as pending" : "Mark as completed"}
                    >
                      {task.status === "completed" ? "↩️ Undo" : "✓ Complete"}
                    </button>

                    <button
                      className="btn-reminder"
                      onClick={() => onUpdateTask(task, "reminder")}
                      title={task.hasReminder ? "Remove reminder" : "Add reminder"}
                    >
                      {task.hasReminder ? "🔔 Remove" : "🔕 Add Reminder"}
                    </button>

                    <button
                      className="btn-important"
                      onClick={() => onUpdateTask(task, "important")}
                      title={task.isImportant ? "Remove important flag" : "Mark as important"}
                    >
                      {task.isImportant ? "⭐ Unstar" : "⭐ Star"}
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => onDeleteTask(task._id)}
                      title="Delete task"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
