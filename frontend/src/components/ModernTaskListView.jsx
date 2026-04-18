import React, { useState, useMemo } from "react";
import "./ModernTaskListView.css";

export default function ModernTaskListView({
  tasks = [],
  onClose,
  onToggleTask,
  onUpdateTask,
  dateDisplay,
  onDownload,
}) {
  const [selectedStatuses, setSelectedStatuses] = useState(["pending", "completed"]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState(["high", "medium", "low"]);

  const uniquePlans = useMemo(() => {
    return [...new Set(tasks.map((t) => t.planTitle || "Other"))];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const status = task.isOverdue ? "overdue" : (task.status || "pending");
      const plan = task.planTitle || "Other";
      const priority = task.priority || "medium";

      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(status);
      const planMatch =
        selectedPlans.length === 0 || selectedPlans.includes(plan);
      const priorityMatch =
        selectedPriorities.length === 0 || selectedPriorities.includes(priority);

      return statusMatch && planMatch && priorityMatch;
    });
  }, [tasks, selectedStatuses, selectedPlans, selectedPriorities]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    filteredTasks.forEach((task) => {
      const plan = task.planTitle || "Other";
      if (!groups[plan]) {
        groups[plan] = [];
      }
      groups[plan].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadgeColor = (task) => {
    if (task.isOverdue) return "#dc2626";
    if (task.status === "completed") return "#10b981";
    return "#6b7280";
  };

  const getStatusBadgeText = (task) => {
    if (task.isOverdue) return "OVERDUE";
    if (task.status === "completed") return "COMPLETED";
    return "PENDING";
  };

  return (
    <div className="modern-task-list-overlay" onClick={onClose}>
      <div className="modern-task-list-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modern-task-list-header">
          <div className="task-list-title">
            <h2>📋 Tasks {dateDisplay && `for ${dateDisplay}`}</h2>
          </div>
          <div className="task-list-actions">
            <button
              className="task-list-download-btn"
              onClick={onDownload}
              disabled={tasks.length === 0}
              title="Download task list as PDF"
            >
              ⬇ Download
            </button>
            <button
              className="task-list-close-btn"
              onClick={onClose}
              title="Close task list"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="modern-task-filters">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <div className="filter-options">
              {["pending", "completed", "overdue"].map((status) => (
                <label key={status} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatuses([...selectedStatuses, status]);
                      } else {
                        setSelectedStatuses(
                          selectedStatuses.filter((s) => s !== status)
                        );
                      }
                    }}
                  />
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Plan:</label>
            <div className="filter-options">
              {uniquePlans.map((plan) => (
                <label key={plan} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans([...selectedPlans, plan]);
                      } else {
                        setSelectedPlans(
                          selectedPlans.filter((p) => p !== plan)
                        );
                      }
                    }}
                  />
                  <span>{plan}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority:</label>
            <div className="filter-options">
              {["high", "medium", "low"].map((priority) => (
                <label key={priority} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(priority)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPriorities([...selectedPriorities, priority]);
                      } else {
                        setSelectedPriorities(
                          selectedPriorities.filter((p) => p !== priority)
                        );
                      }
                    }}
                  />
                  <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="modern-task-list-body">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="no-tasks-message">
              <p>📭 No tasks found</p>
            </div>
          ) : (
            Object.entries(groupedTasks).map(([plan, planTasks]) => (
              <div key={plan} className="task-group">
                <div className="task-group-header">
                  <h3>{plan}</h3>
                  <span className="task-count">{planTasks.length}</span>
                </div>

                <div className="task-group-list">
                  {planTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`modern-task-item ${task.status === "completed" ? "completed" : ""}`}
                      style={{
                        borderLeftColor: getPriorityColor(task.priority || "medium"),
                      }}
                    >
                      <button
                        className="modern-task-checkbox"
                        onClick={() => onToggleTask(task)}
                        title={
                          task.status === "completed"
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {task.status === "completed" ? "✓" : "○"}
                      </button>

                      <div className="modern-task-content">
                        <h4 className="modern-task-title">{task.title}</h4>
                        <p className="modern-task-plan">{plan}</p>
                        <div className="modern-task-badges">
                          <span
                            className="modern-priority-badge"
                            style={{ backgroundColor: getPriorityColor(task.priority || "medium") }}
                          >
                            {(task.priority || "medium").toUpperCase()}
                          </span>
                          <span
                            className="modern-status-badge"
                            style={{ backgroundColor: getStatusBadgeColor(task) }}
                          >
                            {getStatusBadgeText(task)}
                          </span>
                        </div>
                      </div>

                      <button
                        className="modern-task-action-btn"
                        onClick={() => onToggleTask(task)}
                        title={
                          task.status === "completed"
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {task.status === "completed" ? "Undo" : "Mark as Done"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
