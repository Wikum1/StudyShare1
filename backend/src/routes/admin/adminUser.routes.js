const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/adminUser.controller");
const { protect, adminOnly } = require("../../middleware/auth.middleware");

router.get("/students", protect, adminOnly, controller.listStudents);
router.put("/students/:id", protect, adminOnly, controller.updateStudent);
router.delete("/students/:id", protect, adminOnly, controller.deleteStudent);

module.exports = router;
