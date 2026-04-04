const express = require("express");
const router = express.Router();

const adminResourceController = require("../../controllers/admin/adminResource.controller");
const { protect, adminOnly } = require("../../middleware/auth.middleware");

router.get("/pending", protect, adminOnly, adminResourceController.getPendingResources);
router.get("/all", protect, adminOnly, adminResourceController.getAllResources);
router.put("/approve/:id", protect, adminOnly, adminResourceController.approveResource);
router.put("/reject/:id", protect, adminOnly, adminResourceController.rejectResource);

module.exports = router;