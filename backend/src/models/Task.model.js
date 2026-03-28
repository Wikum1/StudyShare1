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
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    date: {
      type: String,   // "YYYY-MM-DD" — String to avoid UTC timezone shift
      default: null,
    },
    time: {
      type: String,   // "HH:MM"
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);