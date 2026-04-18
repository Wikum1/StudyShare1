const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  getPlanProgress,
  addMilestone,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
  deletePlan,
} = require("../controllers/studyPlan.controller");

const taskRoutes = require("./Task.routes");

// Protect all study planner routes
router.use(protect);

// ➕ Create Plan
router.post("/", createPlan);

// 📥 Get All Plans
router.get("/", getPlans);

// 📊 Get Plan Progress & Statistics
router.get("/:id/progress", getPlanProgress);

// 🎯 Milestone Routes
router.post("/:id/milestones", addMilestone);
router.put("/:id/milestones/:milestoneId", updateMilestone);
router.patch("/:id/milestones/:milestoneId/complete", completeMilestone);
router.delete("/:id/milestones/:milestoneId", deleteMilestone);

// 🔗 Nested Task Routes
router.use("/:planId/tasks", taskRoutes);

// 📥 Get Single Plan
router.get("/:id", getPlan);

// ✏️ Update Plan
router.put("/:id", updatePlan);

// 🗑 Delete Plan
router.delete("/:id", deletePlan);

module.exports = router;
