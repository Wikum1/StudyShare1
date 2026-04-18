const Task = require("../models/Task.model");

/**
 * Calculate overall progress percentage for a study plan
 * @param {Array} tasks - Array of task objects or IDs
 * @returns {Promise<number>} Progress percentage (0-100)
 */
const calculatePlanProgress = async (tasks) => {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  try {
    // If tasks are IDs, fetch them
    const taskIds = tasks.map((t) => (typeof t === "string" ? t : t._id));
    const taskData = await Task.find({ _id: { $in: taskIds } });

    const totalTasks = taskData.length;
    const completedTasks = taskData.filter((t) => t.status === "completed").length;

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  } catch (err) {
    console.error("Error calculating plan progress:", err);
    return 0;
  }
};

/**
 * Calculate milestone progress
 * @param {Array} milestones - Array of milestone objects
 * @returns {number} Milestone completion percentage
 */
const calculateMilestoneProgress = (milestones) => {
  if (!milestones || milestones.length === 0) {
    return 0;
  }

  const completedMilestones = milestones.filter((m) => m.completed).length;
  return Math.round((completedMilestones / milestones.length) * 100);
};

/**
 * Get detailed progress statistics for a plan
 * @param {Object} plan - Study plan with tasks populated
 * @returns {Promise<Object>} Detailed progress stats
 */
const getProgressStats = async (plan) => {
  const taskIds = plan.tasks.map((t) => (typeof t === "string" ? t : t._id));
  const tasks = await Task.find({ _id: { $in: taskIds } });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  // Task breakdown by priority
  const tasksByPriority = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const completedByPriority = {
    high: tasks.filter((t) => t.priority === "high" && t.status === "completed")
      .length,
    medium: tasks.filter((t) => t.priority === "medium" && t.status === "completed")
      .length,
    low: tasks.filter((t) => t.priority === "low" && t.status === "completed")
      .length,
  };

  const overallProgress = calculatePlanProgress(tasks);
  const milestoneProgress = calculateMilestoneProgress(plan.milestones);

  const daysUntilDue = plan.dueDate
    ? Math.ceil((plan.dueDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isOnTrack =
    daysUntilDue !== null
      ? overallProgress >= Math.round((100 / Math.max(daysUntilDue, 1)) * ((new Date() - plan.createdAt) / (1000 * 60 * 60 * 24)))
      : null;

  return {
    overallProgress,
    milestoneProgress,
    taskStats: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      byPriority: tasksByPriority,
      completedByPriority,
    },
    dueDate: plan.dueDate,
    daysUntilDue,
    isOnTrack,
    milestones: plan.milestones.map((m) => ({
      title: m.title,
      description: m.description,
      targetDate: m.targetDate,
      completed: m.completed,
      completedDate: m.completedDate,
      isOverdue:
        !m.completed && new Date(m.targetDate) < new Date(),
    })),
  };
};

/**
 * Check if any milestones should be marked as overdue
 * @param {Array} milestones - Array of milestone objects
 * @returns {Array} Updated milestones
 */
const updateMilestoneStatus = (milestones) => {
  return milestones.map((m) => ({
    ...m,
    isOverdue: !m.completed && new Date(m.targetDate) < new Date(),
  }));
};

/**
 * Suggest optimization recommendations based on progress
 * @param {Object} stats - Progress stats object
 * @returns {Array<string>} Array of recommendations
 */
const getOptimizationRecommendations = (stats) => {
  const recommendations = [];

  if (stats.overallProgress < 30 && stats.taskStats.total > 0) {
    recommendations.push("Consider breaking down tasks into smaller, more manageable chunks");
  }

  if (stats.isOnTrack === false && stats.daysUntilDue && stats.daysUntilDue > 0) {
    recommendations.push(
      `You're behind schedule. Focus on ${stats.taskStats.byPriority.high} high-priority tasks to catch up`
    );
  }

  if (stats.taskStats.byPriority.high > 0 && stats.completedByPriority.high === 0) {
    recommendations.push("Start with high-priority tasks to build momentum");
  }

  if (stats.daysUntilDue && stats.daysUntilDue < 7 && stats.overallProgress < 80) {
    recommendations.push("⚠️ Plan deadline approaching! Accelerate completion");
  }

  if (stats.milestones.some((m) => m.isOverdue && !m.completed)) {
    recommendations.push("Some milestones are overdue. Review and reschedule if needed");
  }

  return recommendations;
};

module.exports = {
  calculatePlanProgress,
  calculateMilestoneProgress,
  getProgressStats,
  updateMilestoneStatus,
  getOptimizationRecommendations,
};
