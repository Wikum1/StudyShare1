const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/adminResource.controller");

router.get("/", controller.getAllResources);
router.put("/:id/approve", controller.approveResource);
router.put("/:id/reject", controller.rejectResource);

module.exports = router;