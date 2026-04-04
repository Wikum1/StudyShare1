const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reaction", "resource", "task"],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    reactionType: {
      type: String,
      default: null
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
