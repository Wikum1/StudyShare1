import React, { useEffect, useState, useCallback } from "react";
import {
  getPlans,
  createPlan,
  addTask,
  updateTask,
  deletePlan,
  deleteTask,
} from "../services/studyPlanService";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import TaskDetailsModal from "../components/TaskDetailsModal";
import reminderService from "../services/reminderService";

import "./StudyCalendar.css";

function formatDateToYMD(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayLocalDateString() {
  const now = new Date();
  return formatDateToYMD(now);
}

// Convert 24-hour time (HH:MM) to 12-hour format
function convertTo12Hour(time24) {
  if (!time24) return { hour: "9", minute: "00", period: "AM" };
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return {
    hour: String(hour12),
    minute: minutes || "00",
    period: period
  };
}

// Convert 12-hour format to 24-hour time (HH:MM)
function convertTo24Hour(hour12, minute, period) {
  let hour = parseInt(hour12) || 0;
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }
  return `${String(hour).padStart(2, "0")}:${minute || "00"}`;
}

export default function StudyCalendar() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // "day", "week", "month"
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal state for task details
  const [showModalTaskDetails, setShowModalTaskDetails] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState(new Date());
  const [modalTasks, setModalTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Plan creation state
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Task creation state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    time: "09:00",
    taskTimeHour: "9",
    taskTimeMinute: "00",
    taskTimePeriod: "AM",
    isImportant: false,
    hasReminder: false,
    reminderDate: "",
    reminderTime: "",
    reminderTimeHour: "9",
    reminderTimeMinute: "00",
    reminderTimePeriod: "AM"
  });
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      setError("Please log in to access study plans");
    } else {
      setIsAuthenticated(true);
      fetchPlans();
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user || !user.token) {
        setIsAuthenticated(false);
        setError("Your session has expired. Please log in again.");
        return;
      }

      const data = await getPlans();
      setPlans(data);
      reminderService.initialize();
      if (data.length > 0) {
        setSelectedPlan(data[0]);
        reminderService.scheduleBulkReminders(
          data.flatMap((plan) => plan.tasks || [])
        );
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Your session has expired. Please log in again to access your study plans.");
        localStorage.removeItem("user");
      } else {
        setError(err?.response?.data?.message || "Failed to fetch plans");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatePlan = async () => {
    const cleanedPlanName = newPlanName.trim();

    if (!cleanedPlanName) {
      setError("Please enter a plan name");
      return;
    }

    try {
      setCreatingPlan(true);
      setError("");
      
      const newPlan = await createPlan({ title: cleanedPlanName });
      
      setPlans([...plans, newPlan]);
      setSelectedPlan(newPlan);
      setNewPlanName("");
      setShowCreatePlanModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create plan");
      console.error(err);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleAddTask = async () => {
    if (!selectedPlan) {
      setError("Please select a study plan first");
      return;
    }

    const cleanedTitle = taskFormData.title.trim();
    if (!cleanedTitle) {
      setError("Please enter a task title");
      return;
    }

    if (!taskFormData.taskTimeHour || !taskFormData.taskTimeMinute) {
      setError("Please enter a time");
      return;
    }

    if (taskFormData.hasReminder && (!taskFormData.reminderDate || !taskFormData.reminderTimeHour)) {
      setError("Please set both reminder date and time");
      return;
    }

    try {
      setAddingTask(true);
      setError("");

      // Convert 12-hour format to 24-hour
      const time24 = convertTo24Hour(taskFormData.taskTimeHour, taskFormData.taskTimeMinute, taskFormData.taskTimePeriod);
      const reminderTime24 = taskFormData.hasReminder 
        ? convertTo24Hour(taskFormData.reminderTimeHour, taskFormData.reminderTimeMinute, taskFormData.reminderTimePeriod)
        : null;

      const newTask = {
        title: cleanedTitle,
        date: formatDateToYMD(currentDate),
        time: time24,
        isImportant: taskFormData.isImportant,
        hasReminder: taskFormData.hasReminder,
        reminderDateTime: taskFormData.hasReminder 
          ? `${taskFormData.reminderDate}T${reminderTime24}` 
          : null,
        status: "pending"
      };

      const updatedPlan = await addTask(selectedPlan._id, newTask);
      
      // Update the selectedPlan in state
      setSelectedPlan(updatedPlan);
      setPlans(plans.map(p => p._id === updatedPlan._id ? updatedPlan : p));
      
      // Reset form and close modal
      setTaskFormData({
        title: "",
        time: "09:00",
        taskTimeHour: "9",
        taskTimeMinute: "00",
        taskTimePeriod: "AM",
        isImportant: false,
        hasReminder: false,
        reminderDate: "",
        reminderTime: "",
        reminderTimeHour: "9",
        reminderTimeMinute: "00",
        reminderTimePeriod: "AM"
      });
      setShowAddTaskModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add task");
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const getTodayLocalDateString = () => {
    const now = new Date();
    return formatDateToYMD(now);
  };

  const getAllTasksForDate = (dateStr) => {
    if (!selectedPlan) return [];
    const tasksForDate = selectedPlan.tasks?.filter(
      (task) => task.date === dateStr
    ) || [];
    return tasksForDate.sort((a, b) => {
      const timeA = parseInt(a.time.replace(":", ""));
      const timeB = parseInt(b.time.replace(":", ""));
      return timeA - timeB;
    });
  };

  const getWeekDates = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const startDate = new Date(d.setDate(diff));
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(formatDateToYMD(date));
    }
    return weekDates;
  };

  const handleOpenDayTasks = (date) => {
    const dateStr = formatDateToYMD(date);
    setModalSelectedDate(date);
    const tasksForDate = getAllTasksForDate(dateStr);
    setModalTasks(tasksForDate);
    setShowModalTaskDetails(true);
  };

  const handleUpdateTaskProperty = async (task, property) => {
    try {
      setError("");
      let updateData = {};

      if (property === "important") {
        updateData.isImportant = !task.isImportant;
      } else if (property === "reminder") {
        if (task.hasReminder) {
          updateData.hasReminder = false;
          updateData.reminderDateTime = null;
        } else {
          const [year, month, day] = task.date.split("-").map(Number);
          const [hours, minutes] = task.time.split(":").map(Number);
          const taskDateTime = new Date(year, month - 1, day, hours, minutes);
          const reminderDateTime = new Date(
            taskDateTime.getTime() - 6 * 60 * 60 * 1000
          );
          
          updateData.hasReminder = true;
          updateData.reminderDateTime = reminderDateTime.toISOString();
        }
      } else if (property === "complete") {
        updateData.status = task.status === "completed" ? "pending" : "completed";
      }

      const planContainingTask = plans.find((p) =>
        (p.tasks || []).some((t) => t._id === task._id)
      );

      if (planContainingTask) {
        await updateTask(planContainingTask._id, task._id, updateData);
        await fetchPlans();
        
        // Update modal tasks if still open
        if (showModalTaskDetails) {
          const dateStr = formatDateToYMD(modalSelectedDate);
          const updatedTasks = getAllTasksForDate(dateStr);
          setModalTasks(updatedTasks);
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || `Failed to update task: ${err.message}`
      );
      console.error(err);
    }
  };

  const handleToggleTask = (task) => {
    handleUpdateTaskProperty(task, "complete");
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setError("");
      const planContainingTask = plans.find((p) =>
        (p.tasks || []).some((t) => t._id === taskId)
      );

      if (planContainingTask) {
        await deleteTask(planContainingTask._id, taskId);
        await fetchPlans();
        
        // Update modal tasks
        if (showModalTaskDetails) {
          const dateStr = formatDateToYMD(modalSelectedDate);
          const updatedTasks = getAllTasksForDate(dateStr);
          setModalTasks(updatedTasks);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete task");
      console.error(err);
    }
  };

  // Date navigation
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Format date display
  const getDateDisplay = () => {
    if (viewMode === "day") {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      return currentDate.toLocaleDateString("en-US", options);
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(currentDate);
      const start = new Date(weekDates[0] + "T00:00:00");
      const end = new Date(weekDates[6] + "T00:00:00");
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      const options = { month: "long", year: "numeric" };
      return currentDate.toLocaleDateString("en-US", options);
    }
  };

  // Day View Component
  const DayView = () => {
    const dateStr = formatDateToYMD(currentDate);
    const tasksForDay = getAllTasksForDate(dateStr);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="day-view-container">
        <div className="day-view-header">
          <div className="day-header-content">
            <h2>📅 {currentDate.toLocaleDateString("en-US", { weekday: "long" })}</h2>
            <p className="day-view-date">{dateStr}</p>
          </div>
          <button
            className="add-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            disabled={!selectedPlan}
            title={selectedPlan ? "Add task to this day" : "Please select a study plan first"}
          >
            + Add Task
          </button>
        </div>

        <div className="day-timeline">
          {hours.map((hour) => {
            const timeStr = `${String(hour).padStart(2, "0")}:00`;
            const tasksAtHour = tasksForDay.filter((task) =>
              task.time.startsWith(String(hour).padStart(2, "0"))
            );

            return (
              <div key={hour} className="timeline-hour">
                <div className="hour-label">{timeStr}</div>
                <div className="hour-tasks">
                  {tasksAtHour.map((task) => (
                    <div
                      key={task._id}
                      className={`timeline-task ${task.status === "completed" ? "completed" : ""} ${task.isImportant ? "important" : ""}`}
                      onClick={() => handleOpenDayTasks(currentDate)}
                    >
                      <div className="task-time">{task.time}</div>
                      <div className="task-title">{task.title}</div>
                      {task.isImportant && <span className="task-badge">⭐</span>}
                      {task.hasReminder && <span className="task-badge">🔔</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {tasksForDay.length === 0 && (
          <div className="no-tasks-message">
            <p>No tasks scheduled for this date</p>
          </div>
        )}
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    return (
      <div className="week-view-container">
        <div className="week-grid">
          <div className="week-header">
            <div className="week-time-column"></div>
            {weekDates.map((dateStr, idx) => {
              const date = new Date(dateStr + "T00:00:00");
              const isToday = dateStr === getTodayLocalDateString();
              return (
                <div
                  key={dateStr}
                  className={`week-day-header ${isToday ? "today" : ""}`}
                  onClick={() => setViewMode("day") || setCurrentDate(new Date(dateStr + "T00:00:00"))}
                >
                  <div className="day-name">{dayNames[idx]}</div>
                  <div className="day-date">{date.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="week-body">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="week-hour-row">
                <div className="hour-label">{String(i).padStart(2, "0")}:00</div>
                {weekDates.map((dateStr) => {
                  const tasksAtTime = getAllTasksForDate(dateStr).filter((task) =>
                    task.time.startsWith(String(i).padStart(2, "0"))
                  );
                  return (
                    <div key={dateStr} className="week-cell">
                      {tasksAtTime.map((task) => (
                        <div
                          key={task._id}
                          className={`week-task ${task.status === "completed" ? "completed" : ""} ${task.isImportant ? "important" : ""}`}
                          onClick={() => {
                            const dateObj = new Date(dateStr + "T00:00:00");
                            handleOpenDayTasks(dateObj);
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const weeks = [];
    let currentWeek = [];

    const tempDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      currentWeek.push(formatDateToYMD(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
      <div className="month-view-container">
        <div className="month-header">
          <h2>{monthNames[month]} {year}</h2>
        </div>

        <div className="month-grid">
          <div className="month-weekdays">
            {dayNames.map((day) => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
          </div>

          <div className="month-dates">
            {weeks.map((week, weekIdx) =>
              week.map((dateStr, dayIdx) => {
                const date = new Date(dateStr + "T00:00:00");
                const tasksForDate = getAllTasksForDate(dateStr);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = dateStr === getTodayLocalDateString();

                return (
                  <div
                    key={dateStr}
                    className={`month-date ${isCurrentMonth ? "" : "other-month"} ${isToday ? "today" : ""}`}
                    onClick={() => {
                      setViewMode("day");
                      setCurrentDate(new Date(dateStr + "T00:00:00"));
                    }}
                  >
                    <div className="date-number">{date.getDate()}</div>
                    <div className="date-tasks">
                      {tasksForDate.slice(0, 2).map((task) => (
                        <div
                          key={task._id}
                          className={`task-dot ${task.isImportant ? "important" : ""}`}
                          title={task.title}
                        >
                          {task.isImportant && "⭐"}
                          {task.hasReminder && "🔔"}
                        </div>
                      ))}
                      {tasksForDate.length > 2 && (
                        <span className="task-count">+{tasksForDate.length - 2}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="study-calendar-container">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      <div className="calendar-controls">
        <div className="control-group">
          <button className="nav-btn" onClick={navigatePrevious}>
            ← Previous
          </button>
          <div className="date-display">{getDateDisplay()}</div>
          <button className="nav-btn" onClick={navigateToday}>
            Today
          </button>
          <button className="nav-btn" onClick={navigateNext}>
            Next →
          </button>
        </div>

        <div className="view-switcher">
          {["day", "week", "month"].map((mode) => (
            <button
              key={mode}
              className={`view-btn ${viewMode === mode ? "active" : ""}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="plan-selector">
        <label>Study Plan:</label>
        <select
          value={selectedPlan?._id || ""}
          onChange={(e) => {
            const plan = plans.find((p) => p._id === e.target.value);
            setSelectedPlan(plan);
          }}
        >
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan._id} value={plan._id}>
              {plan.title}
            </option>
          ))}
        </select>
        <button
          className="create-plan-btn"
          onClick={() => setShowCreatePlanModal(true)}
          title="Create new study plan"
        >
          + New Plan
        </button>
      </div>

      {/* CREATE PLAN MODAL */}
      {showCreatePlanModal && (
        <div className="plan-modal-overlay" onClick={() => setShowCreatePlanModal(false)}>
          <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="plan-modal-header">
              <h3>Create New Study Plan</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreatePlanModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="plan-modal-body">
              <input
                type="text"
                placeholder="Enter plan name (e.g., Spring 2026 Semester)"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlan();
                  }
                }}
                className="plan-input"
                autoFocus
              />
            </div>

            <div className="plan-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreatePlanModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreatePlan}
                disabled={creatingPlan || !newPlanName.trim()}
              >
                {creatingPlan ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div className="task-modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h3>Add New Task</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddTaskModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="task-modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                  }}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Date: {formatDateToYMD(currentDate)}</label>
              </div>

              <div className="form-group">
                <label>Time</label>
                <div className="time-picker-group">
                  <div className="time-inputs">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="HH"
                      value={taskFormData.taskTimeHour}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimeHour: e.target.value
                        })
                      }
                      className="time-input hour-input"
                    />
                    <span className="time-separator">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={taskFormData.taskTimeMinute}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimeMinute: String(e.target.value).padStart(2, "0")
                        })
                      }
                      className="time-input minute-input"
                    />
                  </div>
                  <div className="period-buttons">
                    <button
                      type="button"
                      className={`period-btn ${taskFormData.taskTimePeriod === "AM" ? "active" : ""}`}
                      onClick={() =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimePeriod: "AM"
                        })
                      }
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`period-btn ${taskFormData.taskTimePeriod === "PM" ? "active" : ""}`}
                      onClick={() =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimePeriod: "PM"
                        })
                      }
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={taskFormData.isImportant}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        isImportant: e.target.checked
                      })
                    }
                  />
                  Mark as Important ⭐
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={taskFormData.hasReminder}
                    onChange={(e) => {
                      setTaskFormData({
                        ...taskFormData,
                        hasReminder: e.target.checked,
                        reminderDate: e.target.checked ? formatDateToYMD(currentDate) : "",
                        reminderTime: e.target.checked ? "09:00" : ""
                      });
                    }}
                  />
                  Set Reminder 🔔
                </label>
              </div>

              {taskFormData.hasReminder && (
                <div className="reminder-section">
                  <div className="reminder-date-picker">
                    <label>Reminder Date</label>
                    <button
                      className="date-picker-btn"
                      onClick={() => setShowReminderCalendar(true)}
                    >
                      📅 {taskFormData.reminderDate || "Select date"}
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Reminder Time</label>
                    <div className="time-picker-group">
                      <div className="time-inputs">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          placeholder="HH"
                          value={taskFormData.reminderTimeHour}
                          onChange={(e) =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimeHour: e.target.value
                            })
                          }
                          className="time-input hour-input"
                        />
                        <span className="time-separator">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          value={taskFormData.reminderTimeMinute}
                          onChange={(e) =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimeMinute: String(e.target.value).padStart(2, "0")
                            })
                          }
                          className="time-input minute-input"
                        />
                      </div>
                      <div className="period-buttons">
                        <button
                          type="button"
                          className={`period-btn ${taskFormData.reminderTimePeriod === "AM" ? "active" : ""}`}
                          onClick={() =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimePeriod: "AM"
                            })
                          }
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          className={`period-btn ${taskFormData.reminderTimePeriod === "PM" ? "active" : ""}`}
                          onClick={() =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimePeriod: "PM"
                            })
                          }
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>

                  {showReminderCalendar && (
                    <div className="reminder-calendar-modal">
                      <Calendar
                        value={
                          taskFormData.reminderDate
                            ? new Date(taskFormData.reminderDate)
                            : new Date()
                        }
                        onChange={(date) => {
                          setTaskFormData({
                            ...taskFormData,
                            reminderDate: formatDateToYMD(date)
                          });
                          setShowReminderCalendar(false);
                        }}
                        className="calendar"
                      />
                    </div>
                  )}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="task-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAddTaskModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleAddTask}
                disabled={addingTask || !taskFormData.title.trim()}
              >
                {addingTask ? "Adding..." : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-view-container">
        {!selectedPlan ? (
          <div className="no-plan-message">
            <p>Please select or create a study plan to view tasks</p>
          </div>
        ) : viewMode === "day" ? (
          <DayView />
        ) : viewMode === "week" ? (
          <WeekView />
        ) : (
          <MonthView />
        )}
      </div>

      <TaskDetailsModal
        isOpen={showModalTaskDetails}
        tasks={modalTasks}
        selectedDate={formatDateToYMD(modalSelectedDate)}
        onClose={() => setShowModalTaskDetails(false)}
        onUpdateTask={handleUpdateTaskProperty}
        onDeleteTask={handleDeleteTask}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}
