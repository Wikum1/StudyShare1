import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
    location: "",
    interests: "",
    phoneNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studyPlans, setStudyPlans] = useState([]);
  const [resources, setResources] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = storedUser?.id;

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setFormData({
        name: response.data.user.name,
        bio: response.data.user.bio || "",
        avatar: response.data.user.avatar || "",
        location: response.data.user.location || "",
        interests: response.data.user.interests || "",
        phoneNumber: response.data.user.phoneNumber || ""
      });

      // Fetch related data
      await Promise.all([
        fetchStudyPlans(userId),
        fetchUserResources(userId),
        fetchUserPosts(userId)
      ]);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyPlans = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/study-plans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudyPlans(response.data.plans || response.data || []);
    } catch (err) {
      console.error("Failed to fetch study plans:", err);
    }
  };

  const fetchUserResources = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/resources/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(response.data.resources || response.data || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/posts/user/my-posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(response.data.posts || response.data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      setError("");
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("profilePicture", file);

      const response = await axios.post(
        `${API_URL}/api/users/profile/upload-picture`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Update form data and user state with new avatar
      setFormData(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));
      setUser(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));
      setSuccess("Profile picture updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      setError(err.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setSuccess("");

      const response = await axios.put(
        `${API_URL}/api/users/profile/edit`,
        {
          name: formData.name,
          bio: formData.bio,
          avatar: formData.avatar,
          location: formData.location,
          interests: formData.interests,
          phoneNumber: formData.phoneNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      // Update local storage with new user data
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, name: response.data.user.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile");
    }
  };


  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p className="error-message">User not found</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (str) => {
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-header-bg"></div>
          
          <div className="profile-header-content">
            <div className="avatar-section">
              <div 
                className="profile-avatar-large"
                style={{ backgroundColor: getAvatarColor(user.name) }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span className="avatar-initials">{getInitials(user.name)}</span>
                )}
              </div>
              
              {isEditing && (
                <label className="avatar-upload-overlay">
                  <span className="upload-icon">📷</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              {user.location && <p className="profile-location">📍 {user.location}</p>}
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{studyPlans.length}</span>
                  <span className="stat-label">Study Plans</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{resources.length}</span>
                  <span className="stat-label">Resources</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
              </div>

              <button 
                className="edit-profile-btn"
                onClick={() => {
                  if (isEditing) {
                    setFormData({
                      name: user.name,
                      bio: user.bio || "",
                      avatar: user.avatar || "",
                      location: user.location || "",
                      interests: user.interests || "",
                      phoneNumber: user.phoneNumber || ""
                    });
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? "✕ Cancel" : "✎ Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Edit Form */}
        {isEditing && (
          <div className="edit-form-card">
            <h2>Edit Profile Information</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Colombo, Sri Lanka"
                />
              </div>

              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="form-group form-group-full">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself (max 500 characters)"
                  maxLength="500"
                  rows="4"
                />
                <span className="char-count">{formData.bio.length}/500</span>
              </div>

              <div className="form-group form-group-full">
                <label>Interests</label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., UI/UX Design, Web Development, Photography"
                />
                <p className="field-hint">Separate multiple interests with commas</p>
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveProfile}>
              💾 Save Changes
            </button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            Study Plans ({studyPlans.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            Resources ({resources.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts ({posts.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-tab">
              {user.bio && (
                <div className="info-card">
                  <h3>About</h3>
                  <p>{user.bio}</p>
                </div>
              )}

              {user.interests && (
                <div className="info-card">
                  <h3>Interests</h3>
                  <div className="interests-list">
                    {user.interests.split(",").map((interest, idx) => (
                      <span key={idx} className="interest-tag">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-card">
                <h3>Account Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{user.role || "Student"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Status</span>
                    <span className="detail-value active">Active</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joined</span>
                    <span className="detail-value">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Plans Tab */}
          {activeTab === "plans" && (
            <div className="plans-tab">
              {studyPlans.length > 0 ? (
                <div className="plans-grid">
                  {studyPlans.map((plan) => (
                    <div key={plan._id} className="plan-card">
                      <h4>{plan.title}</h4>
                      {plan.subject && <p className="plan-subject">{plan.subject}</p>}
                      <div className="plan-info">
                        <span>📚 {plan.tasks?.length || 0} Tasks</span>
                        {plan.dueDate && (
                          <span>📅 {new Date(plan.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📚 No study plans yet. Create one to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="resources-tab">
              {resources.length > 0 ? (
                <div className="resources-list">
                  {resources.map((resource) => (
                    <div key={resource._id} className="resource-card">
                      <div className="resource-header">
                        <h4>{resource.title}</h4>
                        <span className={`status-badge status-${resource.status?.toLowerCase()}`}>
                          {resource.status}
                        </span>
                      </div>
                      <p className="resource-description">{resource.description}</p>
                      <div className="resource-meta">
                        <span className="resource-subject">{resource.subject}</span>
                        <span className="resource-date">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📄 No resources uploaded yet. Share your learning materials!</p>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="posts-tab">
              {posts.length > 0 ? (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post._id} className="post-card">
                      <h4>{post.title || "Untitled Post"}</h4>
                      <p className="post-content">{post.content.substring(0, 150)}...</p>
                      <div className="post-meta">
                        <span>❤️ {post.likeCount || 0} Likes</span>
                        <span>💬 {post.commentsCount || 0} Comments</span>
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📝 No posts yet. Share your thoughts with the community!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}