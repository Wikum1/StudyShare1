const Reaction = require("../models/Reaction.model");
const Post = require("../models/Post.model");

// ============ ADD REACTION ============
exports.addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, postId } = req.body;

    // Validate input
    if (!type || !postId) {
      return res.status(400).json({ message: "Type and postId are required" });
    }

    const validTypes = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      user: userId,
      post: postId
    });

    if (existingReaction && existingReaction.type === type) {
      return res.status(400).json({ message: "You have already reacted with this emoji" });
    }

    // Remove old reaction if exists
    if (existingReaction) {
      await Reaction.deleteOne({ _id: existingReaction._id });
    }

    // Create new reaction
    const reaction = await Reaction.create({
      type,
      user: userId,
      post: postId
    });

    const populatedReaction = await reaction.populate("user", "name avatar");

    res.status(201).json({
      message: "Reaction added successfully",
      reaction: populatedReaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add reaction" });
  }
};

// ============ GET REACTIONS ============
exports.getReactions = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const reactions = await Reaction.find({ post: postId })
      .populate("user", "name avatar email")
      .sort({ createdAt: -1 });

    // Group reactions by type with user list
    const groupedReactions = {};
    reactions.forEach(reaction => {
      if (!groupedReactions[reaction.type]) {
        groupedReactions[reaction.type] = {
          type: reaction.type,
          count: 0,
          users: []
        };
      }
      groupedReactions[reaction.type].count += 1;
      groupedReactions[reaction.type].users.push(reaction.user);
    });

    res.status(200).json({
      message: "Reactions retrieved successfully",
      reactions: Object.values(groupedReactions),
      total: reactions.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve reactions" });
  }
};

// ============ REMOVE REACTION ============
exports.removeReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const reactionId = req.params.reactionId;

    const reaction = await Reaction.findById(reactionId);

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    // Check if user is owner of reaction
    if (reaction.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only remove your own reactions" });
    }

    await Reaction.deleteOne({ _id: reactionId });

    res.status(200).json({
      message: "Reaction removed successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove reaction" });
  }
};

// ============ GET USER REACTIONS ============
exports.getUserReactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const reactions = await Reaction.find({ user: userId })
      .populate("user", "name avatar")
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      message: "User reactions retrieved successfully",
      reactions,
      count: reactions.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve user reactions" });
  }
};
