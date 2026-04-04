import React, { useState } from "react";
import "../pages/TaskDetailsModal.css";
import { generateTaskListPDF } from "../utils/taskListPdfGenerator";

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

  const getTaskStatus = (task) => {
    if (task.status === "completed") return "completed";
    
    const [year, month, day] = task.date.split("-").map(Number);
    const taskDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (taskDate < todayNormalized) {
      return "overdue";
    }
    return "pending";
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

  // Group tasks by category (planTitle)
  const groupedTasks = {};
  tasks.forEach((task) => {
    const category = task.planTitle || "Other";
    if (!groupedTasks[category]) {
      groupedTasks[category] = [];
    }
    groupedTasks[category].push(task);
  });

  // Sort tasks within each category by time
  Object.keys(groupedTasks).forEach((category) => {
    groupedTasks[category].sort((a, b) => {
      const timeA = parseInt(a.time.replace(":", ""));
      const timeB = parseInt(b.time.replace(":", ""));
      return timeA - timeB;
    });
  });

  const categories = Object.keys(groupedTasks);
  const priorityColors = {
    high: "#dc2626",
    medium: "#f59e0b",
    low: "#10b981",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Tasks for {formatDateDisplay(selectedDate)}</h2>
          <div className="modal-header-buttons">
            <button 
              className="download-modal-btn" 
              onClick={() => generateTaskListPDF(tasks, selectedDate)}
              disabled={tasks.length === 0}
              title="Download task list as PDF"
            >
              📥 Download
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close modal">
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body task-list-body">
          {categories.length === 0 ? (
            <div className="no-tasks-message">
              <p>No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="task-list-container">
              {categories.map((category) => (
                <div key={category} className="task-section">
                  <div className="section-header">
                    <h3>{category.toUpperCase()}</h3>
                    <span className="task-count">{groupedTasks[category].length}</span>
                  </div>

                  <div className="task-list">
                    {groupedTasks[category].map((task) => (
                      <div
                        key={task._id}
                        className={`task-item ${task.status === "completed" ? "completed" : ""}`}
                        style={{
                          borderLeftColor: priorityColors[task.priority || "medium"],
                        }}
                      >
                        <button
                          className="task-checkbox"
                          onClick={() => onToggleTask(task)}
                          title={task.status === "completed" ? "Mark as pending" : "Mark as completed"}
                        >
                          {task.status === "completed" ? "✓" : "○"}
                        </button>

                        <div className="task-content">
                          <h4 className="task-title">{task.title}</h4>
                          <p className="task-plan-name">{task.planTitle || "Other"}</p>
                          <div className="task-badges">
                            <span className="priority-badge" style={{ backgroundColor: priorityColors[task.priority || "medium"] }}>
                              {(task.priority || "medium").toUpperCase()}
                            </span>
                            <span className={`status-badge status-${getTaskStatus(task)}`}>
                              {getTaskStatus(task).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <button
                          className="mark-done-btn"
                          onClick={() => onToggleTask(task)}
                          title={task.status === "completed" ? "Mark as pending" : "Mark as completed"}
                        >
                          {task.status === "completed" ? "Undo" : "Mark as Done"}
                        </button>
                      </div>
                    ))}
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
