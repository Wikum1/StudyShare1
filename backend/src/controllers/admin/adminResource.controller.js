const Resource = require("../../models/Resource.model");

exports.getAllResources = async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
};

exports.approveResource = async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { status: "Approved" },
    { new: true }
  );
  res.json(resource);
};

exports.rejectResource = async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { status: "Rejected" },
    { new: true }
  );
  res.json(resource);
};