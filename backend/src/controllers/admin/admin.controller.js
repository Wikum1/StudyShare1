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



exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "Only students can be deleted" });
    }

    await student.deleteOne();

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting student" });
  }
};