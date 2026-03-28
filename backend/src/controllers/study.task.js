const Task = require("../models/Task.model");
const StudyPlan = require("../models/StudyPlan.model");

// ➕ Add Task — creates Task doc and pushes ref into Plan
const addTask = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = await Task.create({
      plan: req.params.planId,
      title: req.body.title,
      date: req.body.date || null,   // "YYYY-MM-DD"
      time: req.body.time || null,   // "HH:MM"
    });

    plan.tasks.push(task._id);
    await plan.save();

    // Return the full plan with populated tasks
    const updatedPlan = await StudyPlan.findById(req.params.planId).populate("tasks");
    res.status(201).json(updatedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All Tasks for a Plan
const getTasks = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.planId).populate("tasks");
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    
    res.json(plan.tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get Single Task
const getTask = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    // Verify task belongs to this plan
    if (task.plan.toString() !== req.params.planId) {
      return res.status(404).json({ message: "Task not found in this plan" });
    }
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.body.title  !== undefined) task.title  = req.body.title;
    if (req.body.date   !== undefined) task.date   = req.body.date;
    if (req.body.time   !== undefined) task.time   = req.body.time;
    if (req.body.status !== undefined) task.status = req.body.status;

    await task.save();

    // Return the full plan with populated tasks
    const updatedPlan = await StudyPlan.findById(req.params.planId).populate("tasks");
    res.json(updatedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑 Delete Task — removes Task doc and ref from Plan
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);

    await StudyPlan.findByIdAndUpdate(req.params.planId, {
      $pull: { tasks: req.params.taskId },
    });

    // Return the full plan with populated tasks
    const updatedPlan = await StudyPlan.findById(req.params.planId).populate("tasks");
    res.json(updatedPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addTask, getTasks, getTask, updateTask, deleteTask };