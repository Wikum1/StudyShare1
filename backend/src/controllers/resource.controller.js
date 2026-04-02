const Resource = require("../models/Resource.model");

/* ================= CREATE RESOURCE ================= */
exports.createResource = async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    /* 🔴 VALIDATION */
    if (!title || !description || !subject) {
      return res.status(400).json({
        message: "All fields (title, description, subject) are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required"
      });
    }

    /* 🔥 DEBUG LOG (helps if still failing) */
    console.log("Uploaded File:", req.file);
    console.log("Body:", req.body);

    /* ================= SAVE ================= */
    const resource = await Resource.create({
      title,
      description,
      subject,
      fileUrl: req.file.path.replace(/\\/g, "/"), // 🔥 fix Windows path issue
      status: "Pending"
    });

    res.status(201).json({
      message: "Resource uploaded successfully",
      resource
    });

  } catch (err) {
    console.error("Upload Error:", err);

    res.status(500).json({
      message: err.message || "Server error while uploading resource"
    });
  }
};

/* ================= GET ALL RESOURCES ================= */
exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    console.error("Fetch Error:", err);

    res.status(500).json({
      message: "Server error while fetching resources"
    });
  }
};

/* ================= GET SINGLE RESOURCE ================= */
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    res.status(200).json(resource);
  } catch (err) {
    console.error("Get Error:", err);

    res.status(500).json({
      message: "Error fetching resource"
    });
  }
};

/* ================= DELETE RESOURCE ================= */
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      message: "Resource deleted successfully"
    });
  } catch (err) {
    console.error("Delete Error:", err);

    res.status(500).json({
      message: "Error deleting resource"
    });
  }
};