import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./DashboardNavbar.css";
import logo from "../assets/logo.png";
import axios from "axios";
import { postPreviewText } from "../utils/postPreview";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("Student");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.name) {
      setUserName(storedUser.name);
    }
    setToken(token);

    if (token) {
      fetchUnreadNotifications(token);
      const interval = setInterval(() => fetchUnreadNotifications(token), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const fetchUnreadNotifications = async (userToken) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/notifications?page=1&limit=5`,
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      setUnreadCount(response.data.unreadCount || 0);
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const handleNotificationIconClick = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = (notif) => {
    // Mark as read if unread
    if (!notif.read) {
      markAsRead(notif._id);
    }

    // Navigate based on notification type
    if (notif.post) {
      // For post-related notifications (like, comment, reaction)
      navigate("/dashboard/wall", { state: { scrollToPostId: notif.post._id } });
    } else if (notif.resource) {
      // For resource notifications
      navigate("/dashboard/my-resources", { state: { resourceId: notif.resource._id } });
    } else if (notif.task) {
      // For task notifications
      navigate("/dashboard/study-planner", { state: { taskId: notif.task._id } });
    }

    setShowDropdown(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(
        notifications.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
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

  const getNotificationIcon = (type) => {
    const icons = {
      like: "👍",
      reaction: "😊",
      comment: "💬",
      reply: "↩️",
      follow: "👥",
      resource: "📚",
      task: "✅"
    };
    return icons[type] || "🔔";
  };

  const handleViewAllNotifications = () => {
    setShowDropdown(false);
    navigate("/dashboard/wall");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="dashboard-navbar">
      {/* LEFT SIDE */}
      <div className="dashboard-left">
        <div className="dashboard-logo">
          <Link to="/">
            <img src={logo} alt="StudyShare Logo" />
      
          </Link>
        </div>

        <div className="dashboard-links">
          <NavLink 
            to="/dashboard" 
            end 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>

          <NavLink 
            to="/dashboard/wall" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Wall
          </NavLink>

          <NavLink 
            to="/dashboard/my-resources" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            My Resources
          </NavLink>

          <NavLink 
            to="/dashboard/study-planner" 
            className={({ isActive }) => `study-planner-link ${isActive ? 'active' : ''}`}
          >
            Study Planner
          </NavLink>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="dashboard-right">
        {/* Notification Icon with Dropdown */}
        <div className="notification-container" ref={dropdownRef}>
          <button 
            className="notification-icon-btn-dashboard"
            onClick={handleNotificationIconClick}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge-dashboard">{unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h3>Notifications</h3>
                <button 
                  className="dropdown-close-btn"
                  onClick={() => setShowDropdown(false)}
                >
                  ✕
                </button>
              </div>

              <div className="notification-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-icon">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notif-content">
                        <div className="notif-sender">
                          <strong>{notif.sender?.name || 'Someone'}</strong>
                          <span className="notif-type">
                            {notif.type === "like" && "liked"}
                            {notif.type === "reaction" && `reacted with ${notif.reactionType}`}
                            {notif.type === "comment" && "commented on"}
                            {notif.type === "reply" && "replied to"}
                            {notif.type === "follow" && "started following"}
                            {notif.type === "resource" && "shared a resource"}
                            {notif.type === "task" && "created a task"}
                          </span>
                        </div>
                        {notif.post && (
                          <div className="notif-reference">
                            📌 {postPreviewText(notif.post) || "Post"}
                          </div>
                        )}
                        {notif.resource && (
                          <div className="notif-reference">📚 {notif.resource?.title}</div>
                        )}
                        {notif.task && (
                          <div className="notif-reference">✅ {notif.task?.title}</div>
                        )}
                        <span className="notif-time">{formatDate(notif.createdAt)}</span>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>

              <div className="notification-dropdown-footer">
                <button 
                  className="view-all-btn"
                  onClick={handleViewAllNotifications}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          className="dashboard-user"
          onClick={() => {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            navigate("/dashboard/profile-details");
          }}
          title="View your profile"
        >
          👤 {userName}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}