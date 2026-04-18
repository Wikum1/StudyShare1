const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 5 },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Removed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);