const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minlength: [3, "Plan name must be at least 3 characters"],
      maxlength: [60, "Plan name must be less than 60 characters"],
      validate: {
        validator: function (value) {
          return (
            /^[a-zA-Z0-9\s.,()&-]+$/.test(value) && /[a-zA-Z0-9]/.test(value)
          );
        },
        message: "Plan name contains invalid characters",
      },
    },
    subject: {
      type: String,
      default: "",
    },
    subjectCode: {
      type: String,
      default: "",
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    milestones: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        targetDate: {
          type: Date,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedDate: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
