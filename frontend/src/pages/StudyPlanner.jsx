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

import "./StudyPlanner.css";

// ✅ Parse "YYYY-MM-DD" safely without timezone shift
function parseDateLocal(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// ✅ Get day abbreviation from a local-parsed date
function getDayAbbr(dateStr) {
  const d = parseDateLocal(dateStr);
  if (!d) return null;
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

// ✅ Extract hour string "08" from time like "08:00" or "8:00"
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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPlans();
      setPlans(res.data);

      if (res.data.length > 0) {
        setSelectedPlan((prev) => {
          if (prev) {
            const updatedPlan = res.data.find((p) => p._id === prev._id);
            return updatedPlan || res.data[0];
          }
          return res.data[0];
        });
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
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00",
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ✅ FIXED: uses local date parsing + simple hour comparison
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
    if (!title.trim()) {
      setError("Please enter a plan title");
      return;
    }
    try {
      setError("");
      await createPlan({ title });
      setTitle("");
      await fetchPlans();
    } catch (err) {
      setError("Failed to create plan: " + err.message);
      console.error(err);
    }
  };

  const handleAddTask = async () => {
    if (!taskInput.trim() || !selectedPlan || !taskDate || !taskTime) {
      setError("Please fill in all task fields and select a plan");
      return;
    }

    try {
      setError("");
      await addTask(selectedPlan._id, {
        title: taskInput,
        date: taskDate,   // "YYYY-MM-DD"
        time: taskTime,   // "HH:MM"
      });

      setTaskInput("");
      setTaskDate("");
      setTaskTime("");
      await fetchPlans();
    } catch (err) {
      setError("Failed to add task: " + err.message);
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

  return (
    <div className="planner-container">
      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* HEADER */}
      <div className="planner-header">
        <h1>📅 Study Planner</h1>
        <p>Organize your study schedule and manage your tasks efficiently</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="planner-flex">
        {/* SIDEBAR */}
        <div className="sidebar">
          <h3>
            <span>📚</span>
            <span>My Plans</span>
          </h3>

          <div className="plans-list">
            {loading && plans.length === 0 ? (
              <div className="empty-state">⏳ Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="empty-state">✨ No plans yet. Create your first one!</div>
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
            <input
              placeholder="New plan name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
            />
            <button onClick={handleCreatePlan} disabled={loading}>
              {loading ? "Adding..." : "+ Create Plan"}
            </button>
          </div>
        </div>

        {/* MAIN TIMETABLE */}
        <div className="timetable">
          {/* HEADER SECTION */}
          <div className="timetable-header">
            <h2 className={`plan-title-bar ${!selectedPlan ? "disabled" : ""}`}>
              {selectedPlan ? `📖 ${selectedPlan.title}` : "📖 No plan selected"}
            </h2>
          </div>

          {/* TASK INPUT SECTION */}
          <div className="task-input-section">
            <label className="task-input-label">Add New Task</label>
            <div className="task-input">
              <input
                placeholder="Task name..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                title="Task date"
              />
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                title="Task time"
              />
              <button
                onClick={handleAddTask}
                disabled={!taskInput.trim() || !taskDate || !taskTime || !selectedPlan || loading}
                title={!selectedPlan ? "Select a plan first" : "Add this task"}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* TIMETABLE GRID */}
          <div className="timetable-grid">
            {/* GRID HEADER */}
            <div className="table-header">
              <div className="time-col">Time</div>
              {days.map((d) => (
                <div key={d} className="day-col">
                  {d}
                </div>
              ))}
            </div>

            {/* GRID ROWS */}
            {timeSlots.map((time) => (
              <div key={time} className="table-row">
                <div className="time-col">{time}</div>
                {days.map((day) => {
                  const task = selectedPlan ? getTask(day, time) : null;
                  return (
                    <div key={day} className={`cell ${task ? "has-task" : ""}`}>
                      {task && (
                        <div className={`task-box ${task.status === "completed" ? "done" : ""}`}>
                          <span title={task.title}>{task.title}</span>
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

      {/* CALENDAR WIDGET */}
      {showCalendar && (
        <div className="calendar-box">
          <div className="calendar-header">
            <h4>Calendar</h4>
            <button
              className="calendar-close-btn"
              onClick={() => setShowCalendar(false)}
              title="Hide calendar"
            >
              ✕
            </button>
          </div>
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </div>
      )}

      {/* CALENDAR TOGGLE BUTTON */}
      {!showCalendar && (
        <button
          className="calendar-toggle-btn"
          onClick={() => setShowCalendar(true)}
          title="Show calendar"
        >
          📅
        </button>
      )}
    </div>
  );
}
