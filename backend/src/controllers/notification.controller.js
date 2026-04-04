const Notification = require("../models/Notification.model");

// ============ GET USER NOTIFICATIONS ============
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name avatar email")
      .populate("post", "title")
      .populate("relatedComment", "content")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
      pagination: {
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / limit),
        currentPage: page
      },
      unreadCount
    });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ============ MARK AS READ ============
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user is the recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (err) {
    console.error("Error marking notification as read:", err.message);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// ============ DELETE NOTIFICATION ============
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user is the recipient
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      message: "Notification deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting notification:", err.message);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ============ CREATE NOTIFICATION (Internal) ============
exports.createNotification = async (type, sender, recipient, post, message, relatedComment = null) => {
  try {
    // Don't notify if sender is the recipient (author)
    if (sender.toString() === recipient.toString()) {
      return;
    }

    const notification = new Notification({
      type,
      sender,
      recipient,
      post,
      relatedComment,
      message
    });

    await notification.save();
    console.log("✅ Notification created:", notification._id);
  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
};
