const express = require("express");
const router = express.Router();

const {
  createPlan,
  getPlans,
  addTask,
  updateTask,
} = require("../controllers/studyPlan.controller");

const StudyPlan = require("../models/StudyPlan.model");

// ➕ Create Plan
router.post("/", createPlan);

// 📥 Get Plans
router.get("/", getPlans);

// ➕ Add Task
router.post("/:id/tasks", addTask);

// 🔄 Update Task
router.put("/:planId/tasks/:taskId", updateTask);

// 🗑 DELETE PLAN
router.delete("/:id", async (req, res) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🗑 DELETE TASK
router.delete("/:planId/tasks/:taskId", async (req, res) => {
  try {
    const plan = await require("../models/StudyPlan.model").findById(req.params.planId);

    plan.tasks = plan.tasks.filter(
      (task) => task._id.toString() !== req.params.taskId
    );

    await plan.save();

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ UPDATE PLAN NAME
router.put("/:id", async (req, res) => {
  try {
    const plan = await require("../models/StudyPlan.model").findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true }
    );

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

