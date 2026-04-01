const mongoose = require("mongoose");

const ALLOWED_TIME_SLOTS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

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
      enum: {
        values: ALLOWED_TIME_SLOTS,
        message: "Task time must match an available planner time slot",
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