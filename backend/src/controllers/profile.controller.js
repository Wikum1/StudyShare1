const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User.model");

/** Normalize JWT `id` (string or ObjectId-like) to a valid Mongo id string. */
function resolveUserId(req) {
  const raw = req.user?.id ?? req.user?._id ?? req.user?.userId;
  if (raw == null) return null;
  const id =
    typeof raw === "object" && raw !== null && typeof raw.toString === "function"
      ? raw.toString()
      : String(raw).trim();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
}

// Get logged-in user's profile (no password is returned).
exports.getMe = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authentication" });
    }

    const user = await User.findById(userId)
      .select("-password -__v")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { _id, ...rest } = user;
    res.json({ user: { ...rest, id: _id } });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// Update logged-in user's profile.
// Allowed fields: name, email (optional), password (optional), university, year, modules.
exports.updateMe = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Invalid authentication" });
    }

    const { name, email, password, university, year, modules } = req.body || {};

    if (!name && !email && !password && university === undefined && year === undefined && modules === undefined) {
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
        _id: { $ne: userId },
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
      const uniStr = String(university).trim();
      // Allow empty string to clear.
      updateData.university = uniStr;
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

      const cleaned = moduleList
        .map((m) => String(m).trim())
        .filter(Boolean);

      // De-duplicate while keeping order.
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

    const updated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password -__v")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { _id, ...rest } = updated;
    res.json({
      message: "Profile updated successfully",
      user: { ...rest, id: _id },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

