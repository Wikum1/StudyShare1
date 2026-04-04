const User = require("../../models/User.model");
const Resource = require("../../models/Resource.model");

/* ================= GET ALL STUDENTS ================= */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (err) {
    console.error("Students Fetch Error:", err);
    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

/* ================= GET RECENT ACTIVITIES ================= */
exports.getActivities = async (req, res) => {
  try {
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const latestResources = await Resource.find().sort({ createdAt: -1 }).limit(5);

    const userActivities = latestUsers.map((user) => ({
      text: `${user.name} registered as ${user.role}`
    }));

    const resourceActivities = latestResources.map((resource) => ({
      text: `${resource.title} uploaded with status ${resource.status}`
    }));

    const activities = [...userActivities, ...resourceActivities];

    res.status(200).json(activities);
  } catch (err) {
    console.error("Activities Fetch Error:", err);
    res.status(500).json({
      message: "Failed to fetch activities"
    });
  }
};