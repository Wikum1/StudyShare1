const Resource = require("../models/Resource.model");
const User = require("../models/User.model");
const { createNotification } = require("./notification.controller");

/* ================= CREATE RESOURCE ================= */
exports.createResource = async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    const uploaderId = req.user.id;

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

    console.log("Uploaded File:", req.file);
    console.log("Body:", req.body);

    const resource = await Resource.create({
      title,
      description,
      subject,
      fileUrl: req.file.path.replace(/\\/g, "/"),
      uploadedBy: uploaderId,
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

/* ================= STUDENT VIEW ================= */
/* only approved resources should be visible to students */
exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ status: "Approved" }).sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({
      message: "Server error while fetching resources"
    });
  }
};

/* ================= ADMIN: GET PENDING RESOURCES ================= */
exports.getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ status: "Pending" }).sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    console.error("Pending Fetch Error:", err);
    res.status(500).json({
      message: "Server error while fetching pending resources"
    });
  }
};

/* ================= ADMIN: GET ALL RESOURCES ================= */
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    console.error("All Resource Fetch Error:", err);
    res.status(500).json({
      message: "Server error while fetching all resources"
    });
  }
};

/* ================= ADMIN: APPROVE RESOURCE ================= */
exports.approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    ).populate("uploadedBy", "name");

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    // Get all users except the uploader
    const allUsers = await User.find({ _id: { $ne: resource.uploadedBy._id } });

    // Create notifications for all users
    for (const user of allUsers) {
      await createNotification(
        "resource",
        resource.uploadedBy._id,
        user._id,
        {
          resource: resource._id,
          message: `${resource.uploadedBy.name} shared a new resource: "${resource.title}"`
        }
      );
    }

    res.status(200).json({
      message: "Resource approved successfully",
      resource
    });
  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({
      message: "Server error while approving resource"
    });
  }
};

/* ================= ADMIN: REJECT RESOURCE ================= */
exports.rejectResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    res.status(200).json({
      message: "Resource rejected successfully",
      resource
    });
  } catch (err) {
    console.error("Reject Error:", err);
    res.status(500).json({
      message: "Server error while rejecting resource"
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