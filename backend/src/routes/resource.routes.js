const express = require("express");
const router = express.Router();

const { uploadMiddleware } = require("../middleware/upload.middleware");
const { protect } = require("../middleware/auth.middleware");
const controller = require("../controllers/resource.controller");

/* Upload resource */
router.post("/", protect, uploadMiddleware, controller.createResource);

/* Get user resources */
router.get("/my", protect, controller.getMyResources);

/* Optional routes */
router.get("/:id", protect, controller.getResourceById);
router.delete("/:id", protect, controller.deleteResource);

module.exports = router;