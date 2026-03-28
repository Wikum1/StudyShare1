import React, { useEffect, useState } from "react";
import {
  getPlans,
  createPlan,
  addTask,
  updateTask,
  deletePlan,
  deleteTask,
  updatePlan,
} from "../services/studyPlanService";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { motion } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import "./StudyPlanner.css";

export default function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [taskDate, setTaskDate] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchPlans();
  }, []);

  // 📊 Progress
  const getProgress = (plan) => {
    if (!plan?.tasks?.length) return 0;
    const completed = plan.tasks.filter(
      (t) => t.status === "completed"
    ).length;
    return Math.round((completed / plan.tasks.length) * 100);
  };

  // 📅 Highlight calendar dates
  const hasTaskOnDate = (date) => {
    if (!selectedPlan) return false;

    return selectedPlan.tasks.some((task) => {
      if (!task.date) return false;

      return (
        new Date(task.date).toDateString() ===
        new Date(date).toDateString()
      );
    });
  };

  const fetchPlans = async () => {
    const res = await getPlans();
    setPlans(res.data);

    if (selectedPlan) {
      const updated = res.data.find(
        (p) => p._id === selectedPlan._id
      );
      setSelectedPlan(updated || null);
    }

    if (!selectedPlan && res.data.length > 0) {
      setSelectedPlan(res.data[0]);
    }
  };

  // ➕ Create
  const handleCreatePlan = async () => {
    if (!title) return;
    const res = await createPlan({ title });
    setTitle("");
    setSelectedPlan(res.data);
    fetchPlans();
  };

  // ➕ Add task
  const handleAddTask = async () => {
    if (!taskInput || !selectedPlan) return;

    await addTask(selectedPlan._id, {
      title: taskInput,
      date: taskDate || null,
    });

    setTaskInput("");
    setTaskDate("");
    fetchPlans();
  };

  // Toggle
  const handleToggle = async (task) => {
    await updateTask(selectedPlan._id, task._id, {
      status: task.status === "pending" ? "completed" : "pending",
    });
    fetchPlans();
  };

  // Delete plan
  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    await deletePlan(id);
    setSelectedPlan(null);
    fetchPlans();
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    await deleteTask(selectedPlan._id, taskId);
    fetchPlans();
  };

  // Edit plan
  const handleEditPlan = async () => {
    const newTitle = prompt("Edit name:", selectedPlan.title);
    if (!newTitle) return;

    await updatePlan(selectedPlan._id, { title: newTitle });
    fetchPlans();
  };

  // Filter plans
  const filteredPlans = plans.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // Filter tasks by date
  const filteredTasks =
    selectedPlan?.tasks?.filter((task) => {
      if (!task.date) return false;

      return (
        new Date(task.date).toDateString() ===
        new Date(selectedDate).toDateString()
      );
    }) || [];

  // Chart data
  const completed = plans.reduce(
    (a, p) => a + p.tasks.filter(t => t.status === "completed").length,
    0
  );

  const pending = plans.reduce(
    (a, p) => a + p.tasks.filter(t => t.status === "pending").length,
    0
  );

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  return (
    <div className="planner-layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>📚 Plans</h3>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul>
          {filteredPlans.map((plan) => (
            <li
              key={plan._id}
              className={selectedPlan?._id === plan._id ? "active" : ""}
              onClick={() => setSelectedPlan(plan)}
            >
              <span>
                {plan.title}
                <small>{getProgress(plan)}%</small>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePlan(plan._id);
                }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* DASHBOARD */}
        <div className="dashboard">

          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <h4>Total Plans</h4>
            <p>{plans.length}</p>
          </motion.div>

          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <h4>Total Tasks</h4>
            <p>{plans.reduce((a, p) => a + p.tasks.length, 0)}</p>
          </motion.div>

          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <h4>Completed</h4>
            <p>{completed}</p>
          </motion.div>

          <motion.div className="card" whileHover={{ scale: 1.05 }}>
            <h4>Chart</h4>
            <PieChart width={200} height={200}>
              <Pie data={chartData} dataKey="value" outerRadius={70}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </motion.div>

        </div>

        {/* CREATE */}
        <div className="create-plan">
          <input
            placeholder="New plan..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={handleCreatePlan}>+ Create</button>
        </div>

        {/* CALENDAR */}
        <div className="calendar-section">
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={({ date }) =>
              hasTaskOnDate(date) ? "highlight" : null
            }
          />
        </div>

        {/* PLAN */}
        {selectedPlan && (
          <div className="plan-view">

            <div className="plan-header">
              <h2>{selectedPlan.title}</h2>
              <button onClick={handleEditPlan}>✏️</button>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getProgress(selectedPlan)}%` }}
              />
            </div>

            <ul>
              {filteredTasks.map((task) => (
                <motion.li
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className={task.status === "completed" ? "completed" : ""}>
                    {task.title}
                  </span>

                  <div>
                    <button onClick={() => handleToggle(task)}>
                      {task.status === "completed" ? "Undo" : "Done"}
                    </button>

                    <button onClick={() => handleDeleteTask(task._id)}>
                      🗑
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="add-task">
              <input
                placeholder="Task..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
              />

              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />

              <button onClick={handleAddTask}>Add</button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}