const WallPost = require("../models/feedWallPost.model");
const User = require("../models/User.model");

const toObjectId = (id) => (id ? id.toString() : id);

const getAuthorName = async (userId) => {
  const user = await User.findById(userId, "name");
  return user?.name || "Student";
};

const normalizeUploadPath = (filePath) => {
  if (!filePath) return filePath;
  const normalized = filePath.toString().replace(/\\/g, "/");
  const marker = "/uploads/";
  const idx = normalized.lastIndexOf(marker);
  if (idx !== -1) return normalized.slice(idx + 1); // "uploads/..."
  // fallback: if already relative (e.g. "uploads/x")
  if (normalized.startsWith("uploads/")) return normalized;
  return normalized;
};

exports.getPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.id ? toObjectId(req.user.id) : null;

    const posts = await WallPost.find()
      .sort({ createdAt: -1 })
      .lean();

    const safeId = currentUserId ? currentUserId.toString() : null;

    const mapped = posts.map((p) => {
      const likedByMe =
        safeId && (p.likes || []).some((id) => id?.toString?.() === safeId);
      const savedByMe =
        safeId && (p.saves || []).some((id) => id?.toString?.() === safeId);

      return {
        _id: p._id,
        topic: p.topic || "",
        content: (p.description || p.content || "").toString(),
        author: p.author,
        authorName: p.authorName,
        createdAt: p.createdAt,
        photos: p.photos || [],
        videoUrl: p.videoUrl,
        comments: (p.comments || [])
          .slice()
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        likeCount: (p.likes || []).length,
        commentCount: (p.comments || []).length,
        saveCount: (p.saves || []).length,
        likedByMe: Boolean(likedByMe),
        savedByMe: Boolean(savedByMe),
      };
    });

    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Server error while fetching wall posts",
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const topic = (req.body?.topic || "").trim();
    const description = (req.body?.description || "").trim();

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const photos = (req.files?.photos || []).map((f) => normalizeUploadPath(f.path));
    const videoFile = (req.files?.video || [])[0];
    const videoUrl = videoFile ? normalizeUploadPath(videoFile.path) : undefined;

    const hasText = Boolean(topic || description);
    const hasMedia = photos.length > 0 || Boolean(videoUrl);

    if (!hasText && !hasMedia) {
      return res.status(400).json({
        message: "Provide a topic/description or photos/videos",
      });
    }

    const authorName = await getAuthorName(userId);

    const post = await WallPost.create({
      topic: topic || "",
      description: description || "",
      photos,
      videoUrl,
      author: userId,
      authorName,
      likes: [],
      saves: [],
      comments: [],
    });

    res.status(201).json({
      _id: post._id,
      topic: post.topic || "",
      content: post.description || "",
      author: post.author,
      authorName: post.authorName,
      createdAt: post.createdAt,
      photos: post.photos || [],
      videoUrl: post.videoUrl,
      comments: [],
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      likedByMe: false,
      savedByMe: false,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Server error while creating post",
    });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const postId = req.params.postId;
    const post = await WallPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingIndex = (post.likes || []).findIndex(
      (id) => id?.toString?.() === userId.toString()
    );

    const likedBefore = existingIndex >= 0;
    if (likedBefore) post.likes.splice(existingIndex, 1);
    else post.likes.push(userId);

    await post.save();

    res.status(200).json({
      postId: post._id,
      likeCount: post.likes.length,
      likedByMe: !likedBefore,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Server error while toggling like",
    });
  }
};

exports.toggleSave = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const postId = req.params.postId;
    const post = await WallPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingIndex = (post.saves || []).findIndex(
      (id) => id?.toString?.() === userId.toString()
    );

    const savedBefore = existingIndex >= 0;
    if (savedBefore) post.saves.splice(existingIndex, 1);
    else post.saves.push(userId);

    await post.save();

    res.status(200).json({
      postId: post._id,
      saveCount: post.saves.length,
      savedByMe: !savedBefore,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Server error while toggling save",
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const content = (req.body?.content || "").trim();
    if (!content) return res.status(400).json({ message: "Comment is required" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const postId = req.params.postId;
    const post = await WallPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const authorName = await getAuthorName(userId);

    post.comments.push({
      author: userId,
      authorName,
      content,
      createdAt: new Date(),
    });

    await post.save();

    res.status(201).json({
      postId: post._id,
      comments: post.comments
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      commentCount: post.comments.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Server error while adding comment",
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const postId = req.params.postId;
    const post = await WallPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only the author can delete their own post
    if (post.author?.toString?.() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    return res.status(200).json({ postId: post._id });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Server error while deleting post",
    });
  }
};

