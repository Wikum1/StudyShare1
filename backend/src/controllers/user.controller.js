const User = require("../models/User.model");

// ============ GET USER PROFILE ============
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "name avatar email")
      .populate("following", "name avatar email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve user profile" });
  }
};

// ============ UPDATE USER PROFILE ============
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, avatar, location, interests, phoneNumber, avatarColor } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hexOk = (v) =>
      typeof v === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v.trim());

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (location !== undefined) user.location = location;
    if (interests !== undefined) user.interests = interests;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (avatarColor !== undefined) {
      if (avatarColor === null || avatarColor === "") {
        user.avatarColor = null;
      } else if (hexOk(avatarColor)) {
        user.avatarColor = avatarColor.trim();
      }
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ============ UPLOAD PROFILE PICTURE ============
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📸 Profile picture upload attempt");
    console.log("User ID:", userId);
    console.log("File received:", req.file?.filename);

    if (!req.file) {
      console.log("❌ No file provided");
      return res.status(400).json({ message: "No file provided" });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate the file URL (adjust based on your server setup)
    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    console.log("✅ File URL:", fileUrl);

    // Update user avatar
    user.avatar = fileUrl;
    await user.save();
    console.log("✅ Profile picture updated successfully");

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      avatar: fileUrl,
      user
    });
  } catch (err) {
    console.error("❌ Error uploading profile picture:", err.message);
    res.status(500).json({ message: "Failed to upload profile picture", error: err.message });
  }
};

// ============ FOLLOW USER ============
exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (user.following.includes(targetUserId)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Add to following list
    user.following.push(targetUserId);
    await user.save();

    // Add to followers list
    targetUser.followers.push(userId);
    await targetUser.save();

    res.status(200).json({
      message: "User followed successfully",
      followingCount: user.following.length,
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to follow user" });
  }
};

// ============ UNFOLLOW USER ============
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.userId;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if following
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove from following list
    user.following = user.following.filter(id => id.toString() !== targetUserId);
    await user.save();

    // Remove from followers list
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
    await targetUser.save();

    res.status(200).json({
      message: "User unfollowed successfully",
      followingCount: user.following.length,
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unfollow user" });
  }
};
