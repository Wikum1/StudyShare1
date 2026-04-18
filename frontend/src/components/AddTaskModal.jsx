import React, { useState } from "react";
import "./AddTaskModal.css";

export default function AddTaskModal({ isOpen, onClose, onAddTask, selectedDate }) {
  const [taskName, setTaskName] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedPriority, setPriority] = useState("medium");
  const [errors, setErrors] = useState({});

  const timeSlots = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00",
  ];

  const convertTo12Hour = (time24) => {
    const [hour, minute] = time24.split(":");
    const h = parseInt(hour);
    const hourIn12 = h % 12 || 12;
    const period = h >= 12 ? "PM" : "AM";
    return `${hourIn12}:${minute} ${period}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }
    if (taskName.trim().length > 100) {
      newErrors.taskName = "Task name must be less than 100 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddTask({
      title: taskName.trim(),
      time: selectedTime,
      priority: selectedPriority,
    });

    // Reset form
    setTaskName("");
    setSelectedTime("09:00");
    setPriority("medium");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="add-task-overlay" onClick={onClose}>
      <div className="add-task-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-task-header">
          <h2>➕ Add New Task</h2>
          <button className="add-task-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-task-form">
          {/* Task Name Field */}
          <div className="form-group">
            <label htmlFor="taskName" className="form-label">
              Task Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="taskName"
              className={`form-input ${errors.taskName ? "error" : ""}`}
              placeholder="Enter task title (e.g., Solve Math Problem 1-10)"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                if (errors.taskName) {
                  setErrors({ ...errors, taskName: "" });
                }
              }}
              maxLength="100"
            />
            {errors.taskName && (
              <span className="error-message">{errors.taskName}</span>
            )}
            <span className="char-count">{taskName.length}/100</span>
          </div>

          {/* Time Field */}
          <div className="form-group">
            <label htmlFor="taskTime" className="form-label">
              Time <span className="required">*</span>
            </label>
            <div className="time-input-wrapper">
              <select
                id="taskTime"
                className="form-select time-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {convertTo12Hour(time)}
                  </option>
                ))}
              </select>
              <span className="time-display">{convertTo12Hour(selectedTime)}</span>
            </div>
          </div>

          {/* Priority Field */}
          <div className="form-group">
            <label className="form-label">
              Priority <span className="required">*</span>
            </label>
            <div className="priority-options">
              {["high", "medium", "low"].map((priority) => (
                <label key={priority} className="priority-radio">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={selectedPriority === priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                  <span className="priority-label">
                    <span
                      className={`priority-dot priority-${priority}`}
                    ></span>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Display */}
          {selectedDate && (
            <div className="date-display-field">
              <span className="date-label">📅 Date:</span>
              <span className="date-value">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add-task"
            >
              ➕ Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
