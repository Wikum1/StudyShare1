const StudyPlan = require("../models/StudyPlan.model");
const {
  getProgressStats,
  getOptimizationRecommendations,
} = require("../services/progressTracker");

// Plan title validation
const validatePlanTitle = (title) => {
  const cleanedTitle = title?.replace(/\s+/g, " ").trim();

  if (!cleanedTitle) {
    return { valid: false, message: "Plan name is required" };
  }

  if (cleanedTitle.length < 3) {
    return { valid: false, message: "Plan name must be at least 3 characters" };
  }

  if (cleanedTitle.length > 60) {
    return { valid: false, message: "Plan name must be less than 60 characters" };
  }

  if (!/[a-zA-Z0-9]/.test(cleanedTitle)) {
    return { valid: false, message: "Plan name must contain at least one letter or number" };
  }

  if (!/^[a-zA-Z0-9\s.,()&-]+$/.test(cleanedTitle)) {
    return { valid: false, message: "Plan name contains invalid characters" };
  }

  return { valid: true, cleanedTitle };
};

// Create Plan
const createPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const titleValidation = validatePlanTitle(req.body.title);
    if (!titleValidation.valid) {
      return res.status(400).json({ message: titleValidation.message });
    }

    const existingPlan = await StudyPlan.findOne({
      user: userId,
      title: titleValidation.cleanedTitle,
    });

    if (existingPlan) {
      return res.status(400).json({ message: "A plan with this name already exists" });
    }

    const plan = await StudyPlan.create({
      user: userId,
      title: titleValidation.cleanedTitle,
      subject: req.body.subject || "",
      subjectCode: req.body.subjectCode || "",
      tasks: [],
    });

    res.status(201).json(plan);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

// Get All Plans
const getPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await StudyPlan.find({ user: userId }).populate("tasks");
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Plan
const getPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    }).populate("tasks");

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Plan
const updatePlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (req.body.title !== undefined) {
      const titleValidation = validatePlanTitle(req.body.title);
      if (!titleValidation.valid) {
        return res.status(400).json({ message: titleValidation.message });
      }

      const existingPlan = await StudyPlan.findOne({
        user: userId,
        title: titleValidation.cleanedTitle,
        _id: { $ne: req.params.id },
      });

      if (existingPlan) {
        return res.status(400).json({ message: "Another plan with this name already exists" });
      }

      plan.title = titleValidation.cleanedTitle;
    }

    if (req.body.subject !== undefined) plan.subject = req.body.subject;
    if (req.body.subjectCode !== undefined) plan.subjectCode = req.body.subjectCode;
    if (req.body.dueDate !== undefined) {
      plan.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    await plan.save();

    const updatedPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    }).populate("tasks");

    res.json(updatedPlan);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

// Get Plan Progress & Statistics
const getPlanProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    }).populate("tasks");

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const stats = await getProgressStats(plan);
    const recommendations = getOptimizationRecommendations(stats);

    res.json({
      plan: {
        _id: plan._id,
        title: plan.title,
        subject: plan.subject,
        dueDate: plan.dueDate,
      },
      stats,
      recommendations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Milestone
const addMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, targetDate } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ message: "Title and target date are required" });
    }

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.milestones.push({
      title,
      description: description || "",
      targetDate: new Date(targetDate),
      completed: false,
      completedDate: null,
    });

    await plan.save();

    res.status(201).json({
      message: "Milestone added",
      milestone: plan.milestones[plan.milestones.length - 1],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Milestone
const updateMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;
    const { title, description, targetDate } = req.body;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    if (title !== undefined) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (targetDate !== undefined) milestone.targetDate = new Date(targetDate);

    await plan.save();

    res.json({ message: "Milestone updated", milestone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Complete Milestone
const completeMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    milestone.completed = true;
    milestone.completedDate = new Date();

    await plan.save();

    res.json({ message: "Milestone marked as complete", milestone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Milestone
const deleteMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestoneId } = req.params;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    plan.milestones.pull(milestoneId);
    await plan.save();

    res.json({ message: "Milestone deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Plan
const deletePlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  getPlanProgress,
  addMilestone,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
  deletePlan,
};