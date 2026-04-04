const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { protect } = require("../middleware/auth.middleware");
const { postMediaMiddleware } = require("../middleware/upload.middleware");

// ============ USER SPECIFIC ROUTES (MUST BE BEFORE :id) ============
// Get current user's posts
router.get("/user/my-posts", protect, postController.getUserPosts);

// Get saved posts
router.get("/user/saved", protect, postController.getUserSavedPosts);

// ============ PUBLIC ROUTES ============
// Get all posts (with pagination, search, sorting, filtering)
router.get("/", postController.getAllPosts);

// Get single post by ID
router.get("/:id", postController.getPostById);

// ============ AUTHENTICATED ROUTES ============
// Create new post with media (photos and video)
router.post("/", protect, postMediaMiddleware, postController.createPost);

// Update post (only author)
router.put("/:id", protect, postController.updatePost);

// Delete post (only author)
router.delete("/:id", protect, postController.deletePost);

// Toggle like on post
router.post("/:id/like", protect, postController.toggleLikePost);

// Toggle save post (bookmark)
router.post("/:id/save", protect, postController.toggleSavePost);

// Add comment to post
router.post("/:id/comments", protect, postController.addComment);

module.exports = router;
