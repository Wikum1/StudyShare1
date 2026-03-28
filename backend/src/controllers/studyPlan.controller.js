const StudyPlan = require("../models/StudyPlan.model");

// ➕ Create Plan
const createPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.create({
      user: "67f123456789abcdef123456", // temporary user
      title: req.body.title,
      subject: req.body.subject || "",
      subjectCode: req.body.subjectCode || "",
      tasks: [],
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get Plans
const getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Add Task
const addTask = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);

    plan.tasks.push({
      title: req.body.title,
      date: req.body.date || null, // 🆕
    });

    await plan.save();

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Update Task
const updateTask = async (req, res) => {
  try {
    const { planId, taskId } = req.params;

    const plan = await StudyPlan.findById(planId);

    const task = plan.tasks.id(taskId);

    task.status = req.body.status;

    await plan.save();

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPlan,
  getPlans,
  addTask,
  updateTask,
};