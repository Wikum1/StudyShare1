const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/admin.controller");
const { protect, adminOnly } = require("../../middleware/auth.middleware");

router.get("/students", protect, adminOnly, adminController.getAllStudents);
router.get("/activities", protect, adminOnly, adminController.getActivities);
router.delete("/students/:id", protect, adminOnly, adminController.deleteStudent);

module.exports = router;