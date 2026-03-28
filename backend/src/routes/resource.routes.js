const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const controller = require("../controllers/resource.controller");

/* ================= RESOURCE ROUTES ================= */

/* Upload resource */
router.post("/",upload, controller.createResource,
);

/* Get user resources */
router.get("/my", controller.getMyResources);

/* Optional future routes */
router.get("/:id", controller.getResourceById);
router.delete("/:id", controller.deleteResource);

module.exports = router;
