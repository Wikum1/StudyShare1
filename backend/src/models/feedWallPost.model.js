const mongoose = require("mongoose");

const wallCommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const feedWallPostSchema = new mongoose.Schema(
  {
    topic: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, trim: true, maxlength: 2000, default: "" },

    // Media
    photos: [{ type: String }], // stored as /uploads/... paths
    videoUrl: { type: String }, // /uploads/... path

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [wallCommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WallPost", feedWallPostSchema);

