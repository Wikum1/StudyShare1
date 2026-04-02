const Post = require("../models/Post.model");
const SavedPost = require("../models/SavedPost.model");
const Reaction = require("../models/Reaction.model");
const User = require("../models/User.model");
const { ObjectId } = require("mongoose").Types;

// ============ CREATE POST ============
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    console.log("📝 Creating post...");
    console.log("User ID from token:", userId);
    console.log("Title:", title);

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newPost = new Post({
      title,
      content,
      author: userId,
      tags: tags || []
    });

    await newPost.save();
    console.log("✅ Post saved. Author field:", newPost.author);
    console.log("Post ID:", newPost._id);

    await newPost.populate("author", "name avatar email");

    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (err) {
    console.error("❌ Error creating post:", err.message);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// ============ GET ALL POSTS (WITH PAGINATION & FILTERING) ============
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt"; // createdAt, likeCount
    const tag = req.query.tag;
    const search = req.query.search;

    let filter = {};

    // Search by title or content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by tag
    if (tag) {
      filter.tags = tag;
    }

    // Sorting options
    let sortOptions = {};
    if (sortBy === "likeCount") {
      sortOptions = { likeCount: -1 };
    } else if (sortBy === "recent") {
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const totalPosts = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate("author", "name avatar email bio")
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      message: "Posts retrieved successfully",
      posts,
      pagination: {
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve posts" });
  }
};

// ============ GET SINGLE POST ============
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "name avatar email bio followers")
      .populate("reactions");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve post" });
  }
};

// ============ UPDATE POST ============
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { title, content, tags } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;

    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate("author", "name avatar email");

    res.status(200).json({
      message: "Post updated successfully",
      post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// ============ DELETE POST ============
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete all saved posts
    await SavedPost.deleteMany({ post: postId });

    // Delete all reactions
    await Reaction.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// ============ LIKE/UNLIKE POST ============
exports.toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike post
      post.likes = post.likes.filter(id => id.toString() !== userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      // Like post
      post.likes.push(userId);
      post.likeCount += 1;
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      post: {
        _id: post._id,
        likeCount: post.likeCount,
        isLiked: !isLiked
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update like" });
  }
};

// ============ SAVE/UNSAVE POST ============
exports.toggleSavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const savedPost = await SavedPost.findOne({
      user: userId,
      post: postId
    });

    if (savedPost) {
      // Unsave post
      await SavedPost.deleteOne({ _id: savedPost._id });
      res.status(200).json({
        message: "Post unsaved",
        isSaved: false
      });
    } else {
      // Save post
      await SavedPost.create({
        user: userId,
        post: postId
      });
      res.status(200).json({
        message: "Post saved",
        isSaved: true
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save post" });
  }
};

// ============ GET USER'S SAVED POSTS ============
exports.getUserSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const savedPosts = await SavedPost.find({ user: userId })
      .populate({
        path: "post",
        populate: { path: "author", select: "name avatar email" }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalSaved = await SavedPost.countDocuments({ user: userId });

    res.status(200).json({
      message: "Saved posts retrieved",
      savedPosts: savedPosts.map(s => s.post),
      pagination: {
        total: totalSaved,
        pages: Math.ceil(totalSaved / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve saved posts" });
  }
};

// ============ GET USER'S POSTS ============
exports.getUserPosts = async (req, res) => {
  try {
    // Use authenticated user's ID from the request, or from params if provided
    const userId = req.params.userId || req.user.id;
    console.log("🔍 getUserPosts called");
    console.log("Received userId:", userId);
    console.log("Req.user:", req.user);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Try both ObjectId conversion and string matching
    try {
      const objectIdUserId = new ObjectId(userId);
      console.log("Converted to ObjectId:", objectIdUserId);
    } catch (e) {
      console.log("Failed to convert to ObjectId:", userId);
    }

    // Query with string ID (let Mongoose handle conversion)
    const totalUserPosts = await Post.countDocuments({ author: userId });
    console.log("Total posts found with userId:", totalUserPosts);

    const userPosts = await Post.find({ author: userId })
      .populate("author", "name avatar email bio")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log("User posts retrieved:", userPosts.length);
    console.log("Posts details:", userPosts.map(p => ({ _id: p._id, title: p.title, author: p.author })));

    res.status(200).json({
      message: "User posts retrieved",
      posts: userPosts,
      pagination: {
        total: totalUserPosts,
        pages: Math.ceil(totalUserPosts / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error("❌ Error in getUserPosts:", err.message);
    res.status(500).json({ message: "Failed to retrieve user posts", error: err.message });
  }
};
