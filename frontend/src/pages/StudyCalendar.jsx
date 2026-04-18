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

import ModernTaskListView from "../components/ModernTaskListView";
import AddTaskModal from "../components/AddTaskModal";
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

// Convert 12-hour format to 24-hour time (HH:MM)
function convertTo24Hour(hour12, minute, period) {
  let hour = parseInt(hour12, 10) || 0;

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
  const [planFormData, setPlanFormData] = useState({
    title: "",
    planType: "own", // "own" or "module"
    module: "",
    startDate: "",
    endDate: "",
  });

  // Task creation state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    time: "09:00",
    taskTimeHour: "9",
    taskTimeMinute: "00",
    taskTimePeriod: "AM",
    priority: "medium",
    isImportant: false,
    hasReminder: false,
    reminderDate: "",
    reminderTime: "",
    reminderTimeHour: "9",
    reminderTimeMinute: "00",
    reminderTimePeriod: "AM",
  });
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setError("Please log in to access study plans");
        setPlans([]);
        setSelectedPlan(null);
        return;
      }

      const data = await getPlans();
      const plansArray = Array.isArray(data) ? data : [];

      setPlans(plansArray);

      reminderService.initialize();

      if (plansArray.length > 0) {
        setSelectedPlan((prevSelectedPlan) => {
          if (!prevSelectedPlan) return plansArray[0];

          const updatedSelectedPlan = plansArray.find(
            (plan) => plan._id === prevSelectedPlan._id
          );

          return updatedSelectedPlan || plansArray[0];
        });

        reminderService.scheduleBulkReminders(
          plansArray.flatMap((plan) => plan.tasks || [])
        );
      } else {
        setSelectedPlan(null);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        setError(
          "Your session has expired. Please log in again to access your study plans."
        );
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setPlans([]);
        setSelectedPlan(null);
      } else {
        setError(err?.response?.data?.message || "Failed to fetch plans");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setIsAuthenticated(false);
      setError("Please log in to access study plans");
      return;
    }

    setIsAuthenticated(true);
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = async () => {
    const cleanedPlanName = planFormData.title.trim();

    if (!cleanedPlanName) {
      setError("Please enter a plan name");
      return;
    }

    if (!planFormData.startDate || !planFormData.endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (planFormData.planType === "module" && !planFormData.module.trim()) {
      setError("Please enter the module name");
      return;
    }

    try {
      setCreatingPlan(true);
      setError("");

      const newPlan = await createPlan({
        title: cleanedPlanName,
        planType: planFormData.planType,
        module: planFormData.module,
        startDate: planFormData.startDate,
        endDate: planFormData.endDate,
      });

      setPlans((prevPlans) => [...prevPlans, newPlan]);
      setSelectedPlan(newPlan);
      setPlanFormData({
        title: "",
        planType: "own",
        module: "",
        startDate: formatDateToYMD(new Date()),
        endDate: formatDateToYMD(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      });
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

    if (
      taskFormData.hasReminder &&
      (!taskFormData.reminderDate || !taskFormData.reminderTimeHour)
    ) {
      setError("Please set both reminder date and time");
      return;
    }

    try {
      setAddingTask(true);
      setError("");

      const time24 = convertTo24Hour(
        taskFormData.taskTimeHour,
        taskFormData.taskTimeMinute,
        taskFormData.taskTimePeriod
      );

      const reminderTime24 = taskFormData.hasReminder
        ? convertTo24Hour(
            taskFormData.reminderTimeHour,
            taskFormData.reminderTimeMinute,
            taskFormData.reminderTimePeriod
          )
        : null;

      const newTask = {
        title: cleanedTitle,
        date: formatDateToYMD(currentDate),
        time: time24,
        priority: taskFormData.priority,
        isImportant: taskFormData.isImportant,
        hasReminder: taskFormData.hasReminder,
        reminderDateTime: taskFormData.hasReminder
          ? `${taskFormData.reminderDate}T${reminderTime24}`
          : null,
        status: "pending",
      };

      const updatedPlan = await addTask(selectedPlan._id, newTask);

      setSelectedPlan(updatedPlan);
      setPlans((prevPlans) =>
        prevPlans.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
      );

      setTaskFormData({
        title: "",
        time: "09:00",
        taskTimeHour: "9",
        taskTimeMinute: "00",
        taskTimePeriod: "AM",
        priority: "medium",
        isImportant: false,
        hasReminder: false,
        reminderDate: "",
        reminderTime: "",
        reminderTimeHour: "9",
        reminderTimeMinute: "00",
        reminderTimePeriod: "AM",
      });
      setShowAddTaskModal(false);
      setShowReminderCalendar(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add task");
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleAddTaskFromModal = async (taskData) => {
    if (!selectedPlan) {
      setError("Please select a study plan first");
      return;
    }

    if (!taskData.title || !taskData.title.trim()) {
      setError("Please enter a task title");
      return;
    }

    if (!taskData.time) {
      setError("Please select a time");
      return;
    }

    if (!taskData.priority) {
      setError("Please select a priority");
      return;
    }

    try {
      setAddingTask(true);
      setError("");

      const newTask = {
        title: taskData.title.trim(),
        date: formatDateToYMD(currentDate),
        time: taskData.time,
        priority: taskData.priority,
        isImportant: false,
        hasReminder: false,
        status: "pending",
      };

      const updatedPlan = await addTask(selectedPlan._id, newTask);

      setSelectedPlan(updatedPlan);
      setPlans((prevPlans) =>
        prevPlans.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
      );

      setShowAddTaskModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add task");
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const getAllTasksForDate = (dateStr) => {
    if (!selectedPlan) return [];

    const tasksForDate =
      selectedPlan.tasks?.filter((task) => task.date === dateStr) || [];

    return tasksForDate.sort((a, b) => {
      const timeA = parseInt((a.time || "00:00").replace(":", ""), 10);
      const timeB = parseInt((b.time || "00:00").replace(":", ""), 10);
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
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      weekDates.push(formatDateToYMD(weekDate));
    }

    return weekDates;
  };

  const handleOpenDayTasks = (date) => {
    const dateStr = formatDateToYMD(date);
    setModalSelectedDate(date);
    setModalTasks(getAllTasksForDate(dateStr));
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
        updateData.status =
          task.status === "completed" ? "pending" : "completed";
      }

      const planContainingTask = plans.find((p) =>
        (p.tasks || []).some((t) => t._id === task._id)
      );

      if (planContainingTask) {
        const updatedTask = { ...task, ...updateData };

        if (showModalTaskDetails) {
          setModalTasks((prevTasks) =>
            prevTasks.map((t) => (t._id === task._id ? updatedTask : t))
          );
        }

        const updatedPlan = {
          ...planContainingTask,
          tasks: planContainingTask.tasks.map((t) =>
            t._id === task._id ? updatedTask : t
          ),
        };

        setPlans((prevPlans) =>
          prevPlans.map((p) =>
            p._id === planContainingTask._id ? updatedPlan : p
          )
        );

        if (selectedPlan?._id === updatedPlan._id) {
          setSelectedPlan(updatedPlan);
        }

        await updateTask(planContainingTask._id, task._id, updateData);
        await fetchPlans();
        // Notify dashboard to refresh
        window.dispatchEvent(new Event("taskUpdated"));
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || `Failed to update task: ${err.message}`
      );
      console.error(err);
      await fetchPlans();
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

        if (showModalTaskDetails) {
          const dateStr = formatDateToYMD(modalSelectedDate);
          setModalTasks(getAllTasksForDate(dateStr));
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete task");
      console.error(err);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setError("");
      await deletePlan(planId);

      const updatedPlans = plans.filter((plan) => plan._id !== planId);
      setPlans(updatedPlans);

      if (selectedPlan?._id === planId) {
        setSelectedPlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete plan");
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
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return currentDate.toLocaleDateString("en-US", options);
    }

    if (viewMode === "week") {
      const weekDates = getWeekDates(currentDate);
      const start = new Date(`${weekDates[0]}T00:00:00`);
      const end = new Date(`${weekDates[6]}T00:00:00`);

      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    const options = { month: "long", year: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  // Day View Component
  const DayView = () => {
    const tasksForDay = getAllTasksForDate(formatDateToYMD(currentDate));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    const goToPreviousDay = () => {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    };

    const goToNextDay = () => {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    };

    const formatTimeToAmPm = (hour) => {
      if (hour === 0) return "12 AM";
      if (hour < 12) return `${hour} AM`;
      if (hour === 12) return "12 PM";
      return `${hour - 12} PM`;
    };

    return (
      <div className="day-view-simple">
        {/* Top Navigation Bar */}
        <div className="day-top-nav-simple">
          <div className="day-control-group-simple">
            <button className="day-nav-btn" onClick={goToPreviousDay}>
              ← Previous
            </button>

            <div className="day-date-display-center">
              {currentDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button className="day-nav-btn" onClick={goToToday}>
              Today
            </button>

            <button className="day-nav-btn" onClick={goToNextDay}>
              Next →
            </button>
          </div>

          <div className="day-view-switcher-simple">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                className={`day-view-btn ${viewMode === mode ? "active" : ""}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Selector and Controls */}
        <div className="day-plan-controls-simple">
          <div className="day-plan-selector-simple">
            <label>Study Plan:</label>
            <select
              value={selectedPlan?._id || ""}
              onChange={(e) => {
                const plan = plans.find((p) => p._id === e.target.value);
                setSelectedPlan(plan || null);
              }}
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>

          <div className="day-plan-buttons-simple">
            <button
              className="day-create-plan-btn"
              onClick={() => setShowCreatePlanModal(true)}
              title="Create new study plan"
            >
              + New Plan
            </button>

            {selectedPlan && (
              <button
                className="day-delete-plan-btn"
                onClick={() => handleDeletePlan(selectedPlan._id)}
                title="Delete selected study plan"
              >
                🗑 Delete Plan
              </button>
            )}
          </div>
        </div>

        {/* Task Actions Buttons */}
        <div className="day-task-list-action-simple">
          <button
            className="day-add-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            disabled={!selectedPlan}
            title="Add a new task"
          >
            ➕ Add Task
          </button>
          <button
            className="day-view-task-list-btn"
            onClick={() => {
              setModalSelectedDate(currentDate);
              const dateStr = formatDateToYMD(currentDate);
              setModalTasks(getAllTasksForDate(dateStr));
              setShowModalTaskDetails(true);
            }}
            disabled={!selectedPlan}
          >
            📋 View Task List
          </button>
        </div>

        {/* Date Title */}
        <div className="day-title-simple">
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>

        {/* Date Header */}
        <div className="day-header-simple">
          <div className="day-date-display-simple">
            <p className="day-date-number-simple">{currentDate.getDate()}</p>
            <p className="day-date-name-simple">
              {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </div>
        </div>

        <div className="day-timeline-simple">
          {hours.map((hour) => {
            const timeStr = formatTimeToAmPm(hour);
            const tasksAtHour = tasksForDay.filter((task) =>
              (task.time || "").startsWith(String(hour).padStart(2, "0"))
            );

            return (
              <div key={hour} className="timeline-hour-simple">
                <div className="hour-label-simple">{timeStr}</div>

                <div className="hour-tasks-simple">
                  <div className="hour-tasks-content-simple">
                    {tasksAtHour.map((task) => (
                      <div
                        key={task._id}
                        className={`timeline-task ${
                          task.status === "completed" ? "completed" : ""
                        } ${task.isImportant ? "important" : ""}`}
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
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    
    // Time slots from 8 AM to 1 PM (adjustable)
    const startHour = 8;
    const endHour = 17; // 5 PM
    const timeSlots = [];
    
    for (let h = startHour; h < endHour; h++) {
      timeSlots.push({ hour: h, minute: 0 });
      if (h < endHour - 1) {
        timeSlots.push({ hour: h, minute: 30 });
      }
    }

    const formatTime = (hour, minute) => {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    const getTaskPosition = (taskTime) => {
      if (!taskTime) return null;
      const [hours, mins] = taskTime.split(":").map(Number);
      return { hour: hours, minute: mins };
    };

    const getTasksForTimeSlot = (dateStr, hour, minute) => {
      const allTasks = getAllTasksForDate(dateStr);
      return allTasks.filter((task) => {
        const pos = getTaskPosition(task.time);
        if (!pos) return false;
        return pos.hour === hour && pos.minute === minute;
      });
    };

    return (
      <div className="week-view-container">
        <div className="week-view-header">
          <h2>📅 Week View</h2>
          <button
            className="add-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            disabled={!selectedPlan}
            title={selectedPlan ? "Add task to this week" : "Please select a study plan first"}
          >
            + Add Task
          </button>
        </div>

        <div className="week-grid-wrapper">
          <div className="week-grid">
            {/* Header Row - Days */}
            <div className="week-header-corner"></div>
            {weekDates.map((dateStr, dayIdx) => {
              const date = new Date(`${dateStr}T00:00:00`);
              const isToday = dateStr === getTodayLocalDateString();
              return (
                <div key={`header-${dateStr}`} className={`week-header-day ${isToday ? "today" : ""}`}>
                  <div className="week-day-name">{dayNames[dayIdx]}</div>
                  <div className="week-day-number">{date.getDate()}</div>
                </div>
              );
            })}

            {/* Time slots and cells */}
            {timeSlots.map((slot, slotIdx) => (
              <React.Fragment key={`slot-${slotIdx}`}>
                {/* Time label */}
                <div className="week-time-label">
                  {formatTime(slot.hour, slot.minute)}
                </div>

                {/* Day cells for this time slot */}
                {weekDates.map((dateStr, dayIdx) => {
                  const tasksAtSlot = getTasksForTimeSlot(dateStr, slot.hour, slot.minute);
                  const isToday = dateStr === getTodayLocalDateString();

                  return (
                    <div
                      key={`cell-${dateStr}-${slotIdx}`}
                      className={`week-cell ${isToday ? "today" : ""}`}
                    >
                      {tasksAtSlot.map((task) => (
                        <div
                          key={task._id}
                          className={`week-task ${task.status === "completed" ? "completed" : ""} ${
                            task.isImportant ? "important" : ""
                          }`}
                          onClick={() => {
                            const dateObj = new Date(`${dateStr}T00:00:00`);
                            handleOpenDayTasks(dateObj);
                          }}
                          title={task.title}
                        >
                          <div className="task-time-range">{task.time}</div>
                          <div className="task-content">{task.title}</div>
                          {task.isImportant && <span className="task-badge">⭐</span>}
                          {task.hasReminder && <span className="task-badge">🔔</span>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
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

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div className="month-view-container">
        <div className="month-header">
          <h2>
            {monthNames[month]} {year}
          </h2>

          <button
            className="add-task-btn"
            onClick={() => setShowAddTaskModal(true)}
            disabled={!selectedPlan}
            title={
              selectedPlan
                ? "Add task to this month"
                : "Please select a study plan first"
            }
          >
            + Add Task
          </button>
        </div>

        <div className="month-grid">
          <div className="month-weekdays">
            {dayNames.map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="month-dates">
            {weeks.map((week) =>
              week.map((dateStr) => {
                const date = new Date(`${dateStr}T00:00:00`);
                const tasksForDate = getAllTasksForDate(dateStr);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = dateStr === getTodayLocalDateString();

                return (
                  <div
                    key={dateStr}
                    className={`month-date ${isCurrentMonth ? "" : "other-month"} ${
                      isToday ? "today" : ""
                    }`}
                    onClick={() => {
                      setViewMode("day");
                      setCurrentDate(new Date(`${dateStr}T00:00:00`));
                    }}
                  >
                    <div className="date-number">{date.getDate()}</div>

                    <div className="date-tasks">
                      {tasksForDate.slice(0, 2).map((task) => (
                        <div
                          key={task._id}
                          className={`task-dot ${
                            task.isImportant ? "important" : ""
                          }`}
                          title={task.title}
                        >
                          {task.isImportant && "⭐"}
                          {task.hasReminder && "🔔"}
                        </div>
                      ))}

                      {tasksForDate.length > 2 && (
                        <span className="task-count">
                          +{tasksForDate.length - 2}
                        </span>
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

  if (!isAuthenticated) {
    return (
      <div className="study-calendar-container">
        <div className="error-banner">
          <span>{error || "Please log in to access study plans"}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-calendar-container">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {viewMode !== "day" && (
        <>
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
                setSelectedPlan(plan || null);
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

            {selectedPlan && (
              <button
                className="delete-plan-btn"
                onClick={() => handleDeletePlan(selectedPlan._id)}
                title="Delete selected study plan"
              >
                🗑 Delete Plan
              </button>
            )}
          </div>

          {/* VIEW TASK LIST BUTTON */}
          <div className="task-list-button-container">
            <button
              className="view-task-list-btn"
              onClick={() => {
                setModalSelectedDate(currentDate);
                const dateStr = formatDateToYMD(currentDate);
                setModalTasks(getAllTasksForDate(dateStr));
                setShowModalTaskDetails(true);
              }}
              disabled={!selectedPlan}
            >
              📋 View Task List
            </button>
          </div>
        </>
      )}

      {/* CREATE PLAN MODAL */}
      {showCreatePlanModal && (
        <div
          className="plan-modal-overlay"
          onClick={() => setShowCreatePlanModal(false)}
        >
          <div className="plan-modal plan-modal-enhanced" onClick={(e) => e.stopPropagation()}>
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
              {/* Plan Name */}
              <div className="form-group">
                <label htmlFor="plan-name" className="form-label">
                  Plan Name <span className="required">*</span>
                </label>
                <input
                  id="plan-name"
                  type="text"
                  placeholder="e.g., Spring 2026 Semester"
                  value={planFormData.title}
                  onChange={(e) =>
                    setPlanFormData({ ...planFormData, title: e.target.value })
                  }
                  className="plan-input"
                  autoFocus
                />
              </div>

              {/* Plan Type Selection */}
              <div className="form-group">
                <label className="form-label">Plan Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="planType"
                      value="own"
                      checked={planFormData.planType === "own"}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          planType: e.target.value,
                        })
                      }
                    />
                    <span>Own Plan</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="planType"
                      value="module"
                      checked={planFormData.planType === "module"}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          planType: e.target.value,
                        })
                      }
                    />
                    <span>Related to Module</span>
                  </label>
                </div>
              </div>

              {/* Module Name - Only show if "Related to Module" is selected */}
              {planFormData.planType === "module" && (
                <div className="form-group">
                  <label htmlFor="module-name" className="form-label">
                    Module Name <span className="required">*</span>
                  </label>
                  <input
                    id="module-name"
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={planFormData.module}
                    onChange={(e) =>
                      setPlanFormData({
                        ...planFormData,
                        module: e.target.value,
                      })
                    }
                    className="plan-input"
                  />
                </div>
              )}

              {/* Date Range */}
              <div className="form-group form-group-row">
                <div className="form-group-half">
                  <label htmlFor="start-date" className="form-label">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={planFormData.startDate}
                    onChange={(e) =>
                      setPlanFormData({
                        ...planFormData,
                        startDate: e.target.value,
                      })
                    }
                    className="plan-input"
                  />
                </div>
                <div className="form-group-half">
                  <label htmlFor="end-date" className="form-label">
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={planFormData.endDate}
                    onChange={(e) =>
                      setPlanFormData({
                        ...planFormData,
                        endDate: e.target.value,
                      })
                    }
                    className="plan-input"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="plan-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowCreatePlanModal(false);
                  setPlanFormData({
                    title: "",
                    planType: "own",
                    module: "",
                    startDate: formatDateToYMD(new Date()),
                    endDate: formatDateToYMD(
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ),
                  });
                }}
              >
                Cancel
              </button>

              <button
                className="btn-create"
                onClick={handleCreatePlan}
                disabled={creatingPlan || !planFormData.title.trim()}
              >
                {creatingPlan ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div
          className="task-modal-overlay"
          onClick={() => setShowAddTaskModal(false)}
        >
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
                          taskTimeHour: e.target.value,
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
                          taskTimeMinute: String(e.target.value).padStart(
                            2,
                            "0"
                          ),
                        })
                      }
                      className="time-input minute-input"
                    />
                  </div>

                  <div className="period-buttons">
                    <button
                      type="button"
                      className={`period-btn ${
                        taskFormData.taskTimePeriod === "AM" ? "active" : ""
                      }`}
                      onClick={() =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimePeriod: "AM",
                        })
                      }
                    >
                      AM
                    </button>

                    <button
                      type="button"
                      className={`period-btn ${
                        taskFormData.taskTimePeriod === "PM" ? "active" : ""
                      }`}
                      onClick={() =>
                        setTaskFormData({
                          ...taskFormData,
                          taskTimePeriod: "PM",
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
                        isImportant: e.target.checked,
                      })
                    }
                  />
                  Mark as Important ⭐
                </label>
              </div>

              <div className="form-group">
                <label>Priority Level</label>

                <select
                  value={taskFormData.priority}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      priority: e.target.value,
                    })
                  }
                  className="priority-select"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
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
                        reminderDate: e.target.checked
                          ? formatDateToYMD(currentDate)
                          : "",
                        reminderTime: e.target.checked ? "09:00" : "",
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
                      type="button"
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
                              reminderTimeHour: e.target.value,
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
                              reminderTimeMinute: String(
                                e.target.value
                              ).padStart(2, "0"),
                            })
                          }
                          className="time-input minute-input"
                        />
                      </div>

                      <div className="period-buttons">
                        <button
                          type="button"
                          className={`period-btn ${
                            taskFormData.reminderTimePeriod === "AM"
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimePeriod: "AM",
                            })
                          }
                        >
                          AM
                        </button>

                        <button
                          type="button"
                          className={`period-btn ${
                            taskFormData.reminderTimePeriod === "PM"
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setTaskFormData({
                              ...taskFormData,
                              reminderTimePeriod: "PM",
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
                            reminderDate: formatDateToYMD(date),
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
        {loading ? (
          <div className="no-plan-message">
            <p>Loading study plans...</p>
          </div>
        ) : !selectedPlan ? (
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

      {showModalTaskDetails && (
        <ModernTaskListView
          tasks={modalTasks}
          dateDisplay={modalSelectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          onClose={() => setShowModalTaskDetails(false)}
          onUpdateTask={handleUpdateTaskProperty}
          onDeleteTask={handleDeleteTask}
          onToggleTask={handleToggleTask}
          onDownload={() => {
            console.log("Download task list");
          }}
        />
      )}

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAddTask={handleAddTaskFromModal}
        selectedDate={currentDate}
      />
    </div>
  );
}