const Resource = require("../../models/Resource.model");

/* ================= GET PENDING ================= */
exports.getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ status: "Pending" }).sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending resources" });
  }
};

/* ================= GET ALL ================= */
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: "Error fetching resources" });
  }
};

/* ================= APPROVE ================= */
exports.approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({ message: "Resource approved", resource });
  } catch (err) {
    res.status(500).json({ message: "Error approving resource" });
  }
};

/* ================= REJECT ================= */
exports.rejectResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({ message: "Resource rejected", resource });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting resource" });
  }
};