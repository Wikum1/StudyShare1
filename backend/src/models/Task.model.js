const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
      minlength: [3, "Task name must be at least 3 characters"],
      maxlength: [60, "Task name must be less than 60 characters"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9\s.,()&-]+$/.test(value) && /[a-zA-Z0-9]/.test(value);
        },
        message: "Task name contains invalid characters",
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    date: {
      type: String,
      required: [true, "Task date is required"],
      validate: {
        validator: function (value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          const [year, month, day] = value.split("-").map(Number);
          const parsed = new Date(year, month - 1, day);

          return (
            parsed.getFullYear() === year &&
            parsed.getMonth() === month - 1 &&
            parsed.getDate() === day
          );
        },
        message: "Task date must be a valid date in YYYY-MM-DD format",
      },
    },
    time: {
      type: String,
      required: [true, "Task time is required"],
      validate: {
        validator: function (value) {
          if (!/^\d{2}:\d{2}$/.test(value)) return false;

          const [hours, minutes] = value.split(":").map(Number);
          return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
        },
        message: "Task time must be in HH:MM format with valid hours (00-23) and minutes (00-59)",
      },
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    hasReminder: {
      type: Boolean,
      default: false,
    },
    reminderDateTime: {
      type: Date,
      default: null,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);