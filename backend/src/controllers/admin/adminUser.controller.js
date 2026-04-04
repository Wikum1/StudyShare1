const bcrypt = require("bcryptjs");
const User = require("../../models/User.model");
const Notification = require("../../models/Notification.model");
const Resource = require("../../models/Resource.model");

const toPublicUser = (user) => {
  if (!user) return null;
  const { _id, password, __v, ...rest } = user;
  return { ...rest, id: _id };
};

/** Plain JSON-safe object (avoids non-serializable lean fields). */
const formatStudentForAdmin = (doc) => {
  if (!doc || doc._id == null) return null;
  if (String(doc.role || "").toLowerCase() === "admin") return null;
  return {
    id: String(doc._id),
    name: doc.name != null ? String(doc.name) : "",
    email: doc.email != null ? String(doc.email) : "",
    role: doc.role ? String(doc.role) : "student",
    university: doc.university != null ? String(doc.university) : "",
    year: doc.year === undefined ? null : doc.year,
    modules: Array.isArray(doc.modules) ? doc.modules.map(String) : [],
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
};

exports.listStudents = async (req, res) => {
  try {
    // Every signup with role "student" (or missing role); never list admins.
    const filter = { role: { $ne: "admin" } };

    const rawStudents = await User.find(filter)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    const payload = rawStudents
      .map(formatStudentForAdmin)
      .filter((s) => s && s.id);

    return res.status(200).json(payload);
  } catch (err) {
    console.error("Admin list students error:", err);
    return res.status(500).json({
      message: "Server error while listing students",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, university, year, modules } = req.body || {};

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be edited here" });
    }

    if (
      name === undefined &&
      email === undefined &&
      password === undefined &&
      university === undefined &&
      year === undefined &&
      modules === undefined
    ) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updateData = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updateData.name = trimmed;
    }

    if (email !== undefined) {
      const normalized = String(email).trim().toLowerCase();
      if (!normalized) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }
      const existingEmailUser = await User.findOne({
        email: normalized,
        _id: { $ne: id },
      });
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      updateData.email = normalized;
    }

    if (password !== undefined) {
      const passwordStr = String(password);
      if (passwordStr.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
      updateData.password = await bcrypt.hash(passwordStr, 10);
    }

    if (university !== undefined) {
      updateData.university = String(university).trim();
    }

    if (year !== undefined) {
      if (year === null || year === "") {
        updateData.year = null;
      } else {
        const yearNum = Number(year);
        if (!Number.isInteger(yearNum) || yearNum < 1 || yearNum > 10) {
          return res.status(400).json({
            message: "Year must be an integer between 1 and 10",
          });
        }
        updateData.year = yearNum;
      }
    }

    if (modules !== undefined) {
      let moduleList = [];
      if (Array.isArray(modules)) {
        moduleList = modules;
      } else if (typeof modules === "string") {
        moduleList = modules.split(",");
      }
      const cleaned = moduleList.map((m) => String(m).trim()).filter(Boolean);
      const deduped = [];
      const seen = new Set();
      for (const m of cleaned) {
        if (!seen.has(m)) {
          seen.add(m);
          deduped.push(m);
        }
      }
      updateData.modules = deduped;
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password -__v")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student updated successfully",
      user: toPublicUser(updated),
    });
  } catch (err) {
    console.error("Admin update student error:", err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete an admin account" });
    }

    await Notification.deleteMany({ user: id });
    await Resource.updateMany({ uploadedBy: id }, { $unset: { uploadedBy: 1 } });

    await User.findByIdAndDelete(id);

    res.json({ message: "Student removed successfully" });
  } catch (err) {
    console.error("Admin delete student error:", err);
    res.status(500).json({ message: "Server error while removing student" });
  }
};
