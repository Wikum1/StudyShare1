const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ gives access to :planId from parent router

const {
  addTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/study.task");

// ➕ Add Task
router.post("/", addTask);

// 📥 Get All Tasks for a Plan
router.get("/", getTasks);

// 📥 Get Single Task
router.get("/:taskId", getTask);

// ✏️ Update Task
router.put("/:taskId", updateTask);

// 🗑 Delete Task
router.delete("/:taskId", deleteTask);

module.exports = router;