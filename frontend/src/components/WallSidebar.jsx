import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WallSidebar.css";

const WallSidebar = ({ posts = [], userData = {}, onPostUpdated = () => {}, onPostDeleted = () => {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storedUser?.token;
  const userId = storedUser?._id || storedUser?.id;

  // Check authentication
  useEffect(() => {
    if (token && userId) {
      setIsAuthenticated(true);
      fetchNotifications();
    } else {
      setIsAuthenticated(false);
    }
  }, [token, userId]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/notifications?page=1&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Handle edit post
  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditedTitle(post.title);
    setEditedContent(post.content);
  };

  // Save edited post
  const handleSaveEdit = async (postId) => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE}/posts/${postId}`,
        {
          title: editedTitle,
          content: editedContent
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdated(response.data.post);
      setEditingPostId(null);
      setEditedTitle("");
      setEditedContent("");
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(
        `${API_BASE}/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostDeleted(postId);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedTitle("");
    setEditedContent("");
  };

  // Filter user's posts from the posts prop
  const userPosts = posts.filter(post => {
    const postAuthorId = post.author?._id || post.author;
    return postAuthorId === userId;
  });

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return postDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: "👍",
      love: "❤️",
      comment: "💬",
      reply: "↩️",
      follow: "👥"
    };
    return icons[type] || "🔔";
  };

  if (!isAuthenticated) {
    return (
      <aside className="wall-sidebar">
        <div className="sidebar-content login-prompt">
          <div className="login-card">
            <div className="login-icon">👤</div>
            <h3>Join the Community</h3>
            <p>Login to view your profile, posts, and notifications.</p>
            <a href="/login" className="btn-login">
              Login
            </a>
            <p className="signup-hint">
              Don't have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wall-sidebar">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          📝 Posts
        </button>
        <button
          className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("notifications");
            fetchNotifications();
          }}
        >
          🔔 Alerts
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && userData && (
        <div className="sidebar-content profile-tab">
          <div className="profile-card">
            <div className="profile-avatar">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} />
              ) : (
                <div className="avatar-placeholder">
                  {userData.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="profile-info">
              <h3 className="profile-name">{userData.name}</h3>
              <p className="profile-email">{userData.email}</p>

              {userData.bio && (
                <p className="profile-bio">{userData.bio}</p>
              )}

              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-label">Followers</span>
                  <span className="stat-value">
                    {userData.followers?.length || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Following</span>
                  <span className="stat-value">
                    {userData.following?.length || 0}
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-edit-profile">
                  ✎ Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Posts Tab - SIMPLIFIED */}
      {activeTab === "posts" && (
        <div className="sidebar-content posts-tab">
          <div className="posts-header">
            <h3>Your Posts ({userPosts.length})</h3>
          </div>

          {userPosts.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted yet</p>
              <p className="hint">Share your first post to get started!</p>
            </div>
          ) : (
            <div className="posts-list">
              {userPosts.map(post => (
                <div key={post._id} className="post-mini">
                  {editingPostId === post._id ? (
                    // Edit Form
                    <div className="post-edit-form">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="edit-input"
                        placeholder="Post title"
                      />
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="edit-textarea"
                        placeholder="Post content"
                        rows="4"
                      />
                      <div className="edit-form-actions">
                        <button
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-save"
                          onClick={() => handleSaveEdit(post._id)}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Post Display
                    <>
                      <div className="post-mini-header">
                        <h4 className="post-mini-title">{post.title}</h4>
                        <div className="post-mini-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditPost(post)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeletePost(post._id)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      <p className="post-mini-content">{post.content.substring(0, 100)}...</p>
                      <span className="post-mini-date">{formatDate(post.createdAt)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="sidebar-content notifications-tab">
          <div className="notifications-header">
            <h3>Recent Alerts ({notifications.length})</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>No alerts yet</p>
              <p className="hint">You'll see notifications here</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => {
                    setSelectedNotification(notif);
                    if (!notif.read) {
                      markNotificationAsRead(notif._id);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* User Avatar */}
                  <div className="notif-avatar">
                    {notif.sender?.avatar ? (
                      <img src={notif.sender.avatar} alt={notif.sender?.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {notif.sender?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="notif-details">
                    <div className="notif-action">
                      <span className="notif-actor-name">{notif.sender?.name || "Someone"}</span>
                      <span className="notif-action-type">
                        {notif.type === "like" && "liked"}
                        {notif.type === "comment" && "commented on"}
                        {notif.type === "reply" && "replied to"}
                        {notif.type === "follow" && "started following"}
                      </span>
                    </div>

                    {notif.post && (
                      <div className="notif-post-title">
                        📌 {notif.post?.title || "your post"}
                      </div>
                    )}

                    <span className="notif-time">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  {!notif.read && (
                    <div className="notif-unread-badge" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected Notification Detail View */}
          {selectedNotification && (
            <div className="notif-detail-modal">
              <div className="notif-detail-header">
                <h4>Notification Details</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setSelectedNotification(null)}
                >
                  ✕
                </button>
              </div>

              <div className="notif-detail-content">
                <div className="notif-detail-user">
                  {selectedNotification.sender?.avatar ? (
                    <img src={selectedNotification.sender.avatar} alt={selectedNotification.sender?.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedNotification.sender?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="detail-user-name">{selectedNotification.sender?.name || "Someone"}</p>
                    <p className="detail-action">
                      {selectedNotification.type === "like" && "👍 Liked your post"}
                      {selectedNotification.type === "comment" && "💬 Commented on your post"}
                      {selectedNotification.type === "reply" && "↩️ Replied to your post"}
                      {selectedNotification.type === "follow" && "👥 Started following you"}
                    </p>
                  </div>
                </div>

                {selectedNotification.post && (
                  <div className="notif-detail-post">
                    <h5>Post:</h5>
                    <p className="detail-post-title">{selectedNotification.post?.title}</p>
                  </div>
                )}

                {selectedNotification.relatedComment && (
                  <div className="notif-detail-comment">
                    <h5>Comment:</h5>
                    <p className="detail-comment-text">{selectedNotification.relatedComment?.content || selectedNotification.message}</p>
                  </div>
                )}

                {selectedNotification.message && !selectedNotification.relatedComment && (
                  <p className="detail-message">{selectedNotification.message}</p>
                )}

                {selectedNotification.post && (
                  <a 
                    href={`#post-${selectedNotification.post._id}`}
                    className="btn-view-post"
                  >
                    View Post →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default WallSidebar;

