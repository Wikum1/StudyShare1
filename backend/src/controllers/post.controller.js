const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const SavedPost = require("../models/SavedPost.model");
const Reaction = require("../models/Reaction.model");
const User = require("../models/User.model");
const notificationController = require("./notification.controller");
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

    // Process uploaded files
    let photos = [];
    let video = null;

    if (req.files && req.files.length > 0) {
      console.log("📁 Processing", req.files.length, "files");

      for (const file of req.files) {
        const fileSize = file.size;
        const filePath = `/uploads/posts/${file.filename}`;
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (isImage) {
          if (photos.length < 10) {
            photos.push(filePath);
            console.log("✅ Photo added:", filePath);
          } else {
            console.log("⚠️ Too many photos (max 10)");
          }
        } else if (isVideo) {
          const videoSizeMB = fileSize / (1024 * 1024);
          if (videoSizeMB > 5) {
            console.log(
              "❌ Video too large:",
              videoSizeMB.toFixed(2),
              "MB (max 5MB)"
            );
            return res.status(400).json({
              message: `Video must be under 5MB. Your video is ${videoSizeMB.toFixed(
                2
              )}MB`,
            });
          }

          if (!video) {
            video = filePath;
            console.log("✅ Video added:", filePath);
          } else {
            console.log("⚠️ Only 1 video allowed");
          }
        }
      }
    }

    if (photos.length === 0 && !video) {
      console.log("ℹ️ No media attached, post with text only");
    }

    const newPost = new Post({
      title,
      content,
      author: userId,
      tags: tags || [],
      photos,
      video,
      comments: [],
      commentsCount: 0,
    });

    await newPost.save();
    console.log("✅ Post saved. ID:", newPost._id);
    console.log("Photos:", photos.length, "| Video:", !!video);

    await newPost.populate("author", "name avatar email");

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
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
    const sortBy = req.query.sortBy || "createdAt";
    const tag = req.query.tag;
    const search = req.query.search;

    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

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
        limit,
      },
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
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name avatar email",
        },
      })
      .populate("reactions");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      post,
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

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;

    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate("author", "name avatar email");

    res.status(200).json({
      message: "Post updated successfully",
      post,
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
    const userRole = req.user.role;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.author.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
      });
    }

    // Delete all comments belonging to this post
    await Comment.deleteMany({ post: postId });

    // Delete all saved-post records for this post
    await SavedPost.deleteMany({ post: postId });

    // Delete all reactions for this post
    await Reaction.deleteMany({ post: postId });

    // Delete the post itself
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting post:", err.message);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// ============ DELETE COMMENT ============
exports.deleteComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Safety: make sure the comment belongs to the selected post
    if (comment.post.toString() !== postId) {
      return res.status(400).json({ message: "Comment does not belong to this post" });
    }

    const isCommentOwner = comment.author.toString() === userId;
    const isPostOwner = post.author.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    // Remove comment reference from post
    post.comments = post.comments.filter(
      (id) => id.toString() !== commentId
    );
    post.commentsCount = post.comments.length;
    await post.save();

    // Delete the comment document
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: "Comment deleted successfully",
      commentsCount: post.commentsCount,
    });
  } catch (err) {
    console.error("❌ Error deleting comment:", err.message);
    res.status(500).json({ message: "Failed to delete comment" });
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
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(userId);
      post.likeCount += 1;

      const sender = userId;
      const recipient = post.author;
      const message = `Someone liked your post`;

      await notificationController.createNotification(
        "like",
        sender,
        recipient,
        postId,
        message
      );
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      post: {
        _id: post._id,
        likeCount: post.likeCount,
        isLiked: !isLiked,
      },
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
      post: postId,
    });

    if (savedPost) {
      await SavedPost.deleteOne({ _id: savedPost._id });
      res.status(200).json({
        message: "Post unsaved",
        isSaved: false,
      });
    } else {
      await SavedPost.create({
        user: userId,
        post: postId,
      });
      res.status(200).json({
        message: "Post saved",
        isSaved: true,
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
        populate: { path: "author", select: "name avatar email" },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalSaved = await SavedPost.countDocuments({ user: userId });

    res.status(200).json({
      message: "Saved posts retrieved",
      savedPosts: savedPosts.map((s) => s.post),
      pagination: {
        total: totalSaved,
        pages: Math.ceil(totalSaved / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve saved posts" });
  }
};

// ============ GET USER'S POSTS ============
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    console.log("🔍 getUserPosts called");
    console.log("Received userId:", userId);
    console.log("Req.user:", req.user);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const objectIdUserId = new ObjectId(userId);
      console.log("Converted to ObjectId:", objectIdUserId);
    } catch (e) {
      console.log("Failed to convert to ObjectId:", userId);
    }

    const totalUserPosts = await Post.countDocuments({ author: userId });
    console.log("Total posts found with userId:", totalUserPosts);

    const userPosts = await Post.find({ author: userId })
      .populate("author", "name avatar email bio")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log("User posts retrieved:", userPosts.length);
    console.log(
      "Posts details:",
      userPosts.map((p) => ({ _id: p._id, title: p.title, author: p.author }))
    );

    res.status(200).json({
      message: "User posts retrieved",
      posts: userPosts,
      pagination: {
        total: totalUserPosts,
        pages: Math.ceil(totalUserPosts / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("❌ Error in getUserPosts:", err.message);
    res
      .status(500)
      .json({ message: "Failed to retrieve user posts", error: err.message });
  }
};

// ============ ADD COMMENT ============
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      post: id,
    });

    await newComment.save();

    post.comments.push(newComment._id);
    post.commentsCount = post.comments.length;
    await post.save();

    const message = `Someone commented on your post`;

    await notificationController.createNotification(
      "comment",
      userId,
      post.author,
      id,
      message,
      newComment._id
    );

    const populatedComment = await newComment.populate(
      "author",
      "name avatar email"
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ message: "Failed to add comment" });
  }
};