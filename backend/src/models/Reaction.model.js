const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    }
  },
  { timestamps: true }
);

// Compound index to ensure one reaction per user per post/comment
reactionSchema.index({ user: 1, post: 1, unique: true, sparse: true });
reactionSchema.index({ user: 1, comment: 1, unique: true, sparse: true });

module.exports = mongoose.model("Reaction", reactionSchema);
