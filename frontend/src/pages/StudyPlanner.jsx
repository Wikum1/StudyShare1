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

import "./StudyPlanner.css";

function parseDateLocal(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDayAbbr(dateStr) {
  const d = parseDateLocal(dateStr);
  if (!d) return null;
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

function getHourStr(timeStr) {
  if (!timeStr) return null;
  return timeStr.split(":")[0].padStart(2, "0");
}

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [title, setTitle] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");

  const [taskNameError, setTaskNameError] = useState("");
  const [taskDateError, setTaskDateError] = useState("");
  const [taskTimeError, setTaskTimeError] = useState("");
  const [planNameError, setPlanNameError] = useState("");

  const [isImportant, setIsImportant] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);
  
  // Modal state
  const [showModalTaskDetails, setShowModalTaskDetails] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState(new Date());
  const [modalTasks, setModalTasks] = useState([]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPlans();
      setPlans(res.data);

      // Initialize reminder service and schedule reminders
      await reminderService.initialize();
      const allTasks = res.data.flatMap(plan => (plan.tasks || []).map(task => ({
        ...task,
        planTitle: plan.title
      })));
      reminderService.scheduleBulkReminders(allTasks);

      if (res.data.length > 0) {
        setSelectedPlan((prev) => {
          if (prev) {
            const updatedPlan = res.data.find((p) => p._id === prev._id);
            return updatedPlan || res.data[0];
          }
          return res.data[0];
        });
      } else {
        setSelectedPlan(null);
      }
    } catch (err) {
      setError("Failed to load plans: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const timeSlots = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getTodayLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateTaskName = (name) => {
    const cleaned = name.replace(/\s+/g, " ").trim();

    if (!cleaned) return "Task name is required";
    if (cleaned.length < 3) return "Task name must be at least 3 characters";
    if (cleaned.length > 60) return "Task name must be less than 60 characters";
    if (!/[a-zA-Z0-9]/.test(cleaned))
      return "Task name must contain at least one letter or number";
    if (!/^[a-zA-Z0-9\s.,()&-]+$/.test(cleaned))
      return "Task name contains invalid characters";

    return "";
  };

  const validatePlanName = (name) => {
    const cleaned = name.replace(/\s+/g, " ").trim();

    if (!cleaned) return "Plan name is required";
    if (cleaned.length < 3) return "Plan name must be at least 3 characters";
    if (cleaned.length > 60) return "Plan name must be less than 60 characters";
    if (!/[a-zA-Z0-9]/.test(cleaned))
      return "Plan name must contain at least one letter or number";
    if (!/^[a-zA-Z0-9\s.,()&-]+$/.test(cleaned))
      return "Plan name contains invalid characters";

    return "";
  };

  const validateTaskDate = (date) => {
    if (!date) return "Task date is required";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return "Task date must be in YYYY-MM-DD format";

    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);

    const isRealDate =
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day;

    if (!isRealDate) return "Task date must be a valid calendar date";

    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    if (parsed < localToday) return "Past dates are not allowed";

    return "";
  };

  const validateTaskTime = (time) => {
    if (!time) return "Task time is required";
    if (!/^\d{2}:\d{2}$/.test(time)) return "Task time must be in HH:MM format";
    
    const [hours, minutes] = time.split(":").map(Number);
    
    if (hours < 0 || hours > 23) return "Hour must be between 00 and 23";
    if (minutes < 0 || minutes > 59) return "Minutes must be between 00 and 59";
    
    return "";
  };

  const createReminderDateTime = (date, time) => {
    if (!date || !time) return null;
    try {
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const reminderDateTime = new Date(year, month - 1, day, hours, minutes);
      return reminderDateTime.toISOString();
    } catch (e) {
      console.error("Error creating reminder datetime:", e);
      return null;
    }
  };

  const validateReminderDateTime = (reminderDate, reminderTime, taskDate, taskTime, reminderEnabled) => {
    if (!reminderEnabled) return "";

    if (!reminderDate) {
      return "Reminder date is required";
    }

    if (!reminderTime) {
      return "Reminder time is required";
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(reminderTime)) {
      return "Invalid time format. Use HH:MM (e.g., 14:30)";
    }

    if (!taskDate || !taskTime) {
      return "Select task date and time before setting a reminder";
    }

    // Create reminder datetime from reminder date + time
    const [year, month, day] = reminderDate.split("-").map(Number);
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const reminder = new Date(year, month - 1, day, hours, minutes);

    // Create task datetime
    const [taskYear, taskMonth, taskDay] = taskDate.split("-").map(Number);
    const [taskHours, taskMinutes] = taskTime.split(":").map(Number);
    const taskDateTime = new Date(taskYear, taskMonth - 1, taskDay, taskHours, taskMinutes);

    // Validate reminder is before task
    if (reminder >= taskDateTime) {
      return "Reminder must be before the task time";
    }

    const sixHoursBeforeTask = new Date(
      taskDateTime.getTime() - 6 * 60 * 60 * 1000,
    );

    if (reminder > sixHoursBeforeTask) {
      return "Reminder must be at least 6 hours before the task time";
    }

    return "";
  };

  const formatDateToYMD = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  const getReminderTasksForDate = (dateObj) => {
    const selectedYMD = formatDateToYMD(dateObj);

    return plans.flatMap((plan) =>
      (plan.tasks || [])
        .filter(
          (task) => task.hasReminder === true && task.date === selectedYMD,
        )
        .map((task) => ({
          ...task,
          planTitle: plan.title,
        })),
    );
  };

  // Get all tasks including important ones for a specific date
  const getAllTasksForDate = (dateObj) => {
    const selectedYMD = formatDateToYMD(dateObj);

    return plans.flatMap((plan) =>
      (plan.tasks || [])
        .filter((task) => task.date === selectedYMD)
        .map((task) => ({
          ...task,
          planTitle: plan.title,
        })),
    );
  };

  useEffect(() => {
    setSelectedDateReminders(getReminderTasksForDate(selectedDate));
  }, [plans, selectedDate]);

  const getTask = (day, time) => {
    if (!selectedPlan?.tasks) return null;

    const slotHour = getHourStr(time);

    return selectedPlan.tasks.find((t) => {
      const taskDay = getDayAbbr(t.date);
      const taskHour = getHourStr(t.time);
      return taskDay === day && taskHour === slotHour;
    });
  };

  const handleCreatePlan = async () => {
    const cleanedPlanName = title.replace(/\s+/g, " ").trim();
    const nameError = validatePlanName(cleanedPlanName);

    setPlanNameError(nameError);

    if (nameError) {
      setError("");
      return;
    }

    try {
      setError("");
      setPlanNameError("");
      await createPlan({ title: cleanedPlanName });
      setTitle("");
      setPlanNameError("");
      await fetchPlans();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create plan");
      console.error(err);
    }
  };

  const handleAddTask = async () => {
    const cleanedTaskName = taskInput.replace(/\s+/g, " ").trim();

    const nameError = validateTaskName(cleanedTaskName);
    const dateError = validateTaskDate(taskDate);
    const timeError = validateTaskTime(taskTime);
    const reminderValidationError = validateReminderDateTime(
      reminderDate,
      reminderTime,
      taskDate,
      taskTime,
      hasReminder,
    );

    setTaskNameError(nameError);
    setTaskDateError(dateError);
    setTaskTimeError(timeError);
    setReminderError(reminderValidationError);

    if (nameError || dateError || timeError || reminderValidationError) {
      setError("");
      return;
    }

    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    const payload = {
      title: cleanedTaskName,
      date: taskDate,
      time: taskTime,
      priority: priority,
      isImportant: Boolean(isImportant),
      hasReminder: Boolean(hasReminder),
      reminderDateTime: hasReminder ? createReminderDateTime(reminderDate, reminderTime) : null,
    };

    try {
      setError("");
      setTaskNameError("");
      setTaskDateError("");
      setTaskTimeError("");
      setReminderError("");

      await addTask(selectedPlan._id, payload);

      setTaskInput("");
      setTaskDate("");
      setTaskTime("");
      setPriority("medium");
      setIsImportant(false);
      setHasReminder(false);
      setReminderDate("");
      setReminderTime("");
      setShowReminderCalendar(false);
      setTaskNameError("");
      setTaskDateError("");
      setTaskTimeError("");
      setReminderError("");

      await fetchPlans();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add task");
      console.error(err);
    }
  };

  const handleToggle = async (task) => {
    try {
      setError("");
      await updateTask(selectedPlan._id, task._id, {
        status: task.status === "pending" ? "completed" : "pending",
      });
      await fetchPlans();
    } catch (err) {
      setError("Failed to update task: " + err.message);
      console.error(err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      setError("");
      await deletePlan(id);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err) {
      setError("Failed to delete plan: " + err.message);
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setError("");
      await deleteTask(selectedPlan._id, taskId);
      await fetchPlans();
    } catch (err) {
      setError("Failed to delete task: " + err.message);
      console.error(err);
    }
  };

  const handleOpenDayTasks = (date) => {
    setModalSelectedDate(date);
    const tasksForDate = getAllTasksForDate(date);
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
          // Remove reminder
          updateData.hasReminder = false;
          updateData.reminderDateTime = null;
        } else {
          // Set reminder to 6 hours before task
          const [year, month, day] = task.date.split("-").map(Number);
          const [hours, minutes] = task.time.split(":").map(Number);
          const taskDateTime = new Date(year, month - 1, day, hours, minutes);
          const reminderDateTime = new Date(
            taskDateTime.getTime() - 6 * 60 * 60 * 1000
          );
          
          updateData.hasReminder = true;
          updateData.reminderDateTime = reminderDateTime.toISOString();
        }
      }

      // Find the plan containing this task
      const planContainingTask = plans.find((p) =>
        (p.tasks || []).some((t) => t._id === task._id)
      );

      if (planContainingTask) {
        await updateTask(planContainingTask._id, task._id, updateData);
        await fetchPlans();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || `Failed to update task: ${err.message}`
      );
      console.error(err);
    }
  };

  return (
    <div className="planner-container">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      <div className="planner-header">
        <h1>📅 Study Planner</h1>
        <p>Organize your study schedule and manage your tasks efficiently</p>
      </div>

      <div className="planner-flex">
        <div className="sidebar">
          <h3>
            <span>📚</span>
            <span>My Plans</span>
          </h3>

          <div className="plans-list">
            {loading && plans.length === 0 ? (
              <div className="empty-state">⏳ Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="empty-state">
                ✨ No plans yet. Create your first one!
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`plan-item ${selectedPlan?._id === plan._id ? "active" : ""}`}
                  onClick={() => setSelectedPlan(plan)}
                  title={plan.title}
                >
                  <span>{plan.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan._id);
                    }}
                    title="Delete plan"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="create-plan">
            <div className="task-input-field">
              <input
                placeholder="New plan name..."
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  setTitle(value);
                  setPlanNameError(validatePlanName(value));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
              />
              {planNameError && (
                <small className="field-error">{planNameError}</small>
              )}
            </div>

            <button
              onClick={handleCreatePlan}
              disabled={loading || !!validatePlanName(title)}
            >
              {loading ? "Adding..." : "+ Create Plan"}
            </button>
          </div>
        </div>

        <div className="timetable">
          <div className="timetable-header">
            <h2 className={`plan-title-bar ${!selectedPlan ? "disabled" : ""}`}>
              {selectedPlan
                ? `📖 ${selectedPlan.title}`
                : "📖 No plan selected"}
            </h2>
          </div>

          <div className="task-input-section">
            <label className="task-input-label">Add New Task</label>

            <div className="task-input">
              <div className="task-input-field">
                <input
                  placeholder="Task name..."
                  value={taskInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTaskInput(value);
                    setTaskNameError(validateTaskName(value));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
                {taskNameError && (
                  <small className="field-error">{taskNameError}</small>
                )}
              </div>

              <div className="task-input-field">
                <input
                  type="date"
                  value={taskDate}
                  min={getTodayLocalDateString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTaskDate(value);
                    setTaskDateError(validateTaskDate(value));
                    setReminderError(
                      validateReminderDateTime(
                        reminderDate,
                        reminderTime,
                        value,
                        taskTime,
                        hasReminder,
                      ),
                    );
                  }}
                />
                {taskDateError && (
                  <small className="field-error">{taskDateError}</small>
                )}
              </div>

              <div className="task-input-field">
                <input
                  type="text"
                  placeholder="HH:MM (e.g., 14:30)"
                  value={taskTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTaskTime(value);
                    setTaskTimeError(validateTaskTime(value));
                    setReminderError(
                      validateReminderDateTime(
                        reminderDate,
                        reminderTime,
                        taskDate,
                        value,
                        hasReminder,
                      ),
                    );
                  }}
                />
                {taskTimeError && (
                  <small className="field-error">{taskTimeError}</small>
                )}
              </div>

              <div className="task-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                  />
                  Important
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasReminder}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasReminder(checked);

                      if (!checked) {
                        setReminderDate("");
                        setReminderTime("");
                        setShowReminderCalendar(false);
                        setReminderError("");
                      } else {
                        setReminderError(
                          validateReminderDateTime(
                            reminderDate,
                            reminderTime,
                            taskDate,
                            taskTime,
                            true,
                          ),
                        );
                      }
                    }}
                  />
                  Add Reminder
                </label>

                <label className="priority-label">
                  Priority:
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              {hasReminder && (
                <div className="reminder-section">
                  <div className="reminder-inputs-wrapper">
                    <div className="reminder-input-group">
                      <label className="reminder-label">Reminder Date</label>
                      <button
                        type="button"
                        className="reminder-date-picker-btn"
                        onClick={() => setShowReminderCalendar(!showReminderCalendar)}
                      >
                        {reminderDate ? `📅 ${reminderDate}` : "📅 Select Date"}
                      </button>
                    </div>
                    
                    <div className="reminder-input-group">
                      <label className="reminder-label">Reminder Time</label>
                      <input
                        type="text"
                        className="reminder-time-input"
                        placeholder="HH:MM"
                        value={reminderTime}
                        onChange={(e) => {
                          const value = e.target.value;
                          setReminderTime(value);
                          setReminderError(
                            validateReminderDateTime(
                              reminderDate,
                              value,
                              taskDate,
                              taskTime,
                              hasReminder,
                            ),
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  {reminderError && (
                    <div className="reminder-error">{reminderError}</div>
                  )}

                  {showReminderCalendar && (
                    <div className="reminder-calendar-overlay" onClick={() => setShowReminderCalendar(false)}>
                      <div className="reminder-calendar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="reminder-calendar-header">
                          <h3>Select Reminder Date</h3>
                          <button
                            type="button"
                            className="calendar-close-btn"
                            onClick={() => setShowReminderCalendar(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <Calendar
                          value={reminderDate ? new Date(reminderDate + "T00:00:00") : new Date()}
                          onChange={(date) => {
                            const dateStr = formatDateToYMD(date);
                            setReminderDate(dateStr);
                            setReminderError(
                              validateReminderDateTime(
                                dateStr,
                                reminderTime,
                                taskDate,
                                taskTime,
                                hasReminder,
                              ),
                            );
                            setShowReminderCalendar(false);
                          }}
                          minDate={new Date()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleAddTask}
                disabled={
                  !!validateTaskName(taskInput) ||
                  !!validateTaskDate(taskDate) ||
                  !!validateTaskTime(taskTime) ||
                  !!validateReminderDateTime(
                    reminderDate,
                    reminderTime,
                    taskDate,
                    taskTime,
                    hasReminder,
                  ) ||
                  !selectedPlan ||
                  loading
                }
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          <div className="timetable-grid">
            <div className="table-header">
              <div className="time-col">Time</div>
              {days.map((d) => (
                <div key={d} className="day-col">
                  {d}
                </div>
              ))}
            </div>

            {timeSlots.map((time) => (
              <div key={time} className="table-row">
                <div className="time-col">{time}</div>
                {days.map((day) => {
                  const task = selectedPlan ? getTask(day, time) : null;
                  return (
                    <div key={day} className={`cell ${task ? "has-task" : ""}`}>
                      {task && (
                        <div
                          className={`task-box ${task.status === "completed" ? "done" : ""}`}
                        >
                          <div className="task-title-wrap">
                            <span title={task.title}>{task.title}</span>
                            <div className="task-badges">
                              {task.isImportant && (
                                <span className="important-badge">
                                  Important
                                </span>
                              )}
                              {task.hasReminder && (
                                <span className="reminder-badge">Reminder</span>
                              )}
                            </div>
                          </div>

                          <div className="task-actions">
                            <button
                              onClick={() => handleToggle(task)}
                              title={
                                task.status === "completed"
                                  ? "Mark as pending"
                                  : "Mark as complete"
                              }
                            >
                              {task.status === "completed" ? "↩️" : "✓"}
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="calendar-box">
          <div className="calendar-header">
            <h4>📅 Calendar - Click day to view tasks</h4>
            <button
              className="calendar-close-btn"
              onClick={() => setShowCalendar(false)}
              title="Hide calendar"
            >
              ✕
            </button>
          </div>

          <Calendar
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
            }}
            onClickDay={(date) => handleOpenDayTasks(date)}
            tileClassName={({ date, view }) => {
              if (view !== "month") return null;

              const currentYMD = formatDateToYMD(date);

              const hasImportantOnDate = plans.some((plan) =>
                (plan.tasks || []).some(
                  (task) =>
                    task.isImportant === true && task.date === currentYMD,
                ),
              );

              return hasImportantOnDate ? "calendar-important-day" : null;
            }}
          />


        </div>
      )}

      {!showCalendar && (
        <button
          className="calendar-toggle-btn"
          onClick={() => setShowCalendar(true)}
          title="Show calendar"
        >
          📅
        </button>
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={showModalTaskDetails}
        tasks={modalTasks}
        selectedDate={formatDateToYMD(modalSelectedDate)}
        onClose={() => setShowModalTaskDetails(false)}
        onUpdateTask={handleUpdateTaskProperty}
        onDeleteTask={handleDeleteTask}
        onToggleTask={handleToggle}
      />
    </div>
  );
}
