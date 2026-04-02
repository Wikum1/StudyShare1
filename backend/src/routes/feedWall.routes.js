const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/feedWallUpload.middleware");
const controller = require("../controllers/feedWall.controller");

router.use(protect);

router.get("/posts", controller.getPosts);
router.post("/posts", upload, controller.createPost);

router.post("/posts/:postId/like", controller.toggleLike);
router.post("/posts/:postId/save", controller.toggleSave);
router.post("/posts/:postId/comments", controller.addComment);

module.exports = router;

