import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  avatarPlaceholderStyle,
  normalizeHex,
} from "../utils/avatarPlaceholderStyle";
import "./WallSidebar.css";

const AVATAR_COLOR_PRESETS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#0ea5e9",
  "#64748b",
];

const displayStudentId = (user) => {
  if (!user?.email) return "";
  const local = String(user.email).split("@")[0] || "";
  return local.toLowerCase();
};

const WallSidebar = ({
  posts: _posts = [],
  userData = {},
  onPostUpdated = () => {},
  onPostDeleted = () => {},
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedNameDraft, setFeedNameDraft] = useState("");
  const [postCount, setPostCount] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveNameLoading, setSaveNameLoading] = useState(false);
  const [avatarColorDraft, setAvatarColorDraft] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?._id || storedUser?.id;

  const pathname = location.pathname;
  const isMyPostsRoute = pathname.includes("/wall/my-posts");
  const saved = searchParams.get("saved");

  const feedActive =
    pathname.includes("/wall") && !isMyPostsRoute && saved !== "1";
  const savedActive = saved === "1" && !isMyPostsRoute;
  const myPostsActive = isMyPostsRoute;

  useEffect(() => {
    if (token && userId) {
      setIsAuthenticated(true);
      fetchNotifications();
    } else {
      setIsAuthenticated(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileOpen]);

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

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

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

  const goFeed = () => navigate("/dashboard/wall");
  const goSaved = () => navigate("/dashboard/wall?saved=1");
  const goMyPosts = () => navigate("/dashboard/wall/my-posts");

  const openProfileDialog = () => {
    setFeedNameDraft((userData.name || "").trim() || "");
    setAvatarColorDraft(userData.avatarColor ?? null);
    setProfileOpen(true);
    setPostCount(null);
    setProfileLoading(true);
    axios
      .get(`${API_BASE}/posts/user/my-posts`, {
        params: { page: 1, limit: 1 },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const total = res.data.pagination?.total;
        setPostCount(typeof total === "number" ? total : 0);
      })
      .catch(() => setPostCount(null))
      .finally(() => setProfileLoading(false));
  };

  const closeProfileDialog = () => {
    setProfileOpen(false);
  };

  const saveFeedDisplayName = async () => {
    const name = feedNameDraft.trim();
    if (!name) {
      window.alert("Display name cannot be empty.");
      return;
    }
    try {
      setSaveNameLoading(true);
      const res = await axios.put(
        `${API_BASE}/users/profile/edit`,
        {
          name,
          avatarColor: normalizeHex(avatarColorDraft || "") || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.user;
      const prev = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...prev,
          ...updated,
          name: updated.name ?? name,
        })
      );
      window.dispatchEvent(new Event("studyshare-user-updated"));
      closeProfileDialog();
    } catch (err) {
      console.error("Profile update failed:", err);
      window.alert(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaveNameLoading(false);
    }
  };

  const colorPickerValue = normalizeHex(avatarColorDraft || "") || "#667eea";

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
              Don&apos;t have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wall-sidebar wall-sidebar--new">
      <div className="wall-sidebar-card">
        <div className="wall-sidebar-profile">
          <button
            type="button"
            className="wall-sidebar-avatar-btn"
            style={!userData.avatar ? avatarPlaceholderStyle(userData) : undefined}
            onClick={openProfileDialog}
            aria-label="Open profile and feed display name"
          >
            {userData.avatar ? (
              <img src={userData.avatar} alt="" />
            ) : (
              <span className="wall-sidebar-avatar-letter">
                {userData.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </button>
          <div className="wall-sidebar-profile-text">
            <div className="wall-sidebar-name">{userData.name || "Member"}</div>
            <div className="wall-sidebar-id">{displayStudentId(userData)}</div>
          </div>
        </div>

        <div className="wall-sidebar-rule" />

        <nav className="wall-sidebar-nav" aria-label="Wall">
          <button
            type="button"
            className={`wall-sidebar-nav-item ${feedActive ? "is-active" : ""}`}
            onClick={goFeed}
          >
            <span className="wall-sidebar-nav-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM10 5.5h10v2H10v-2zm0 5.5h10v2H10v-2zm0 5.5h10v2H10v-2z" />
              </svg>
            </span>
            <span>Feed</span>
          </button>

          <button
            type="button"
            className={`wall-sidebar-nav-item ${savedActive ? "is-active" : ""}`}
            onClick={goSaved}
          >
            <span className="wall-sidebar-nav-icon" aria-hidden>
              🔖
            </span>
            <span>Saved posts</span>
          </button>

          <button
            type="button"
            className={`wall-sidebar-nav-item ${myPostsActive ? "is-active" : ""}`}
            onClick={goMyPosts}
          >
            <span className="wall-sidebar-nav-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <span>My posts</span>
          </button>
        </nav>
      </div>

      <div className="wall-sidebar-panel">
        <div className="wall-sidebar-panel-header">
          <h3>notifications</h3>
        </div>
        {notifications.length === 0 ? (
          <div className="wall-sidebar-empty">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="wall-sidebar-notifications-list">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`wall-sidebar-notif ${!notif.read ? "unread" : ""}`}
                onClick={() => {
                  setSelectedNotification(notif);
                  if (!notif.read) markNotificationAsRead(notif._id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedNotification(notif);
                    if (!notif.read) markNotificationAsRead(notif._id);
                  }
                }}
              >
                <div
                  className="wall-sidebar-notif-avatar"
                  style={
                    !notif.sender?.avatar
                      ? avatarPlaceholderStyle(notif.sender)
                      : undefined
                  }
                >
                  {notif.sender?.avatar ? (
                    <img src={notif.sender.avatar} alt="" />
                  ) : (
                    <span>
                      {notif.sender?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="wall-sidebar-notif-body">
                  <div className="wall-sidebar-notif-line">
                    <strong>{notif.sender?.name || "Someone"}</strong>
                    <span className="wall-sidebar-notif-type">
                      {notif.type === "like" && " liked your post"}
                      {notif.type === "comment" && " commented"}
                      {notif.type === "reaction" && " reacted"}
                      {notif.type === "follow" && " followed you"}
                    </span>
                  </div>
                  {notif.post?.title && (
                    <div className="wall-sidebar-notif-post">{notif.post.title}</div>
                  )}
                  <span className="wall-sidebar-notif-time">{formatDate(notif.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {profileOpen && (
        <div
          className="wall-profile-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wall-profile-dialog-title"
          onClick={closeProfileDialog}
        >
          <div
            className="wall-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wall-profile-modal-hero">
              <button
                type="button"
                className="wall-profile-modal-close"
                onClick={closeProfileDialog}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 id="wall-profile-dialog-title" className="wall-profile-modal-title">
                Your profile
              </h2>
              <p className="wall-profile-modal-subtitle">
                Manage your display name and account details.
              </p>
            </div>
            <div className="wall-profile-modal-rule" aria-hidden="true" />
            <div className="wall-profile-modal-body">
              <div className="wall-profile-field">
                <label htmlFor="wall-profile-display-name">Display name (feed)</label>
                <input
                  id="wall-profile-display-name"
                  type="text"
                  value={feedNameDraft}
                  onChange={(e) => setFeedNameDraft(e.target.value)}
                  placeholder="Name shown on posts"
                  autoComplete="name"
                />
                <p className="wall-profile-hint">
                  This is how your name appears on the wall and on your posts.
                </p>
              </div>
              <div className="wall-profile-field wall-profile-field--color">
                <label className="wall-profile-field-label-block">
                  Profile icon color
                </label>
                <p className="wall-profile-hint">
                  Letter avatar on the wall, posts, and notifications when no photo is set.
                </p>
                <div className="wall-profile-color-swatches" role="group" aria-label="Preset colors">
                  {AVATAR_COLOR_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`wall-profile-color-swatch ${
                        normalizeHex(avatarColorDraft || "") === hex ? "is-selected" : ""
                      }`}
                      style={{ background: hex }}
                      aria-label={`Use color ${hex}`}
                      onClick={() => setAvatarColorDraft(hex)}
                    />
                  ))}
                </div>
                <div className="wall-profile-color-row">
                  <label htmlFor="wall-profile-color-custom">Custom color</label>
                  <input
                    id="wall-profile-color-custom"
                    type="color"
                    value={colorPickerValue}
                    onChange={(e) => setAvatarColorDraft(e.target.value)}
                  />
                  <button
                    type="button"
                    className="wall-profile-reset-color"
                    onClick={() => setAvatarColorDraft(null)}
                  >
                    Default
                  </button>
                </div>
              </div>
              <div className="wall-profile-readonly">
                <span className="wall-profile-readonly-label">IT number</span>
                <span className="wall-profile-readonly-value">
                  {displayStudentId(userData) || "—"}
                </span>
              </div>
              <div className="wall-profile-readonly">
                <span className="wall-profile-readonly-label">Email</span>
                <span className="wall-profile-readonly-value wall-profile-email">
                  {userData.email || "—"}
                </span>
              </div>
              <div className="wall-profile-readonly">
                <span className="wall-profile-readonly-label">Posts created</span>
                <span className="wall-profile-readonly-value">
                  {profileLoading ? "…" : postCount != null ? String(postCount) : "—"}
                </span>
              </div>
            </div>
            <div className="wall-profile-modal-footer">
              <button
                type="button"
                className="wall-profile-btn wall-profile-btn--ghost"
                onClick={closeProfileDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wall-profile-btn wall-profile-btn--primary"
                onClick={saveFeedDisplayName}
                disabled={saveNameLoading}
              >
                {saveNameLoading ? "Saving…" : "Save profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedNotification && (
        <div className="notif-detail-modal">
          <div className="notif-detail-header">
            <h4>Notification</h4>
            <button
              type="button"
              className="btn-close"
              onClick={() => setSelectedNotification(null)}
            >
              ✕
            </button>
          </div>
          <div className="notif-detail-content">
            <p className="detail-action">
              {selectedNotification.type === "like" && "👍 Liked your post"}
              {selectedNotification.type === "comment" && "💬 Commented on your post"}
            </p>
            {selectedNotification.post && (
              <a
                href={`#post-${selectedNotification.post._id}`}
                className="btn-view-post"
                onClick={() => setSelectedNotification(null)}
              >
                View post →
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default WallSidebar;
