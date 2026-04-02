const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    reminderDateTime: {
      type: Date,
      required: true,
    },
    isTriggered: {
      type: Boolean,
      default: false,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    taskDate: String,
    taskTime: String,
    planTitle: String,
  },
  { timestamps: true }
);

// Index for efficient queries
reminderSchema.index({ user: 1, isTriggered: 1 });
reminderSchema.index({ reminderDateTime: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);
