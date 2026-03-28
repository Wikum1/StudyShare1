const StudyPlan = require("../models/StudyPlan.model");

// ➕ Create Plan
const createPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.create({
      user: "67f123456789abcdef123456", // temporary user
      title: req.body.title,
      subject: req.body.subject || "",
      subjectCode: req.body.subjectCode || "",
      tasks: [],
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All Plans — ✅ populate tasks so frontend gets full task objects
const getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find().populate("tasks");
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get Single Plan — ✅ populate tasks
const getPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id).populate("tasks");
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Plan
const updatePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        subject: req.body.subject,
        subjectCode: req.body.subjectCode,
      },
      { new: true }
    ).populate("tasks");
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑 Delete Plan
const deletePlan = async (req, res) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPlan, getPlans, getPlan, updatePlan, deletePlan };