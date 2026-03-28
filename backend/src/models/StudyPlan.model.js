const mongoose = require("mongoose");

// Task schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  // 🆕 ADD THIS
  date: {
    type: Date,
    required: false,
  },
});

// Study Plan schema
const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      default: "",
    },

    subjectCode: {
      type: String,
      default: "",
    },

    tasks: [taskSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);