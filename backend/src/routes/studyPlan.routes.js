const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/studyPlan.controller");

const taskRoutes = require("./Task.routes");

// Protect all study planner routes
router.use(protect);

// ➕ Create Plan
router.post("/", createPlan);

// 📥 Get All Plans
router.get("/", getPlans);

// 🔗 Nested Task Routes
router.use("/:planId/tasks", taskRoutes);

// 📥 Get Single Plan
router.get("/:id", getPlan);

// ✏️ Update Plan
router.put("/:id", updatePlan);

// 🗑 Delete Plan
router.delete("/:id", deletePlan);

module.exports = router;