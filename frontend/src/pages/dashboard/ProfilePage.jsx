import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = storedUser?.id;

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/${userId}`,
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
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
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
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("profilePicture", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/profile/upload-picture`,
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
      setUser(response.data.user);
      setSuccess("Profile picture updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      setError(err.response?.data?.message || "Failed to upload profile picture");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/profile/edit`,
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
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header-card">
          <div className="profile-content">
            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="avatar-upload-btn" title="Click to upload profile picture">
                +
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePictureUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>

            <div className="profile-stats">
              <div className="stat">
                <div className="stat-label">FOLLOWERS</div>
                <div className="stat-value">{user.followers?.length || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-label">FOLLOWING</div>
                <div className="stat-value">{user.following?.length || 0}</div>
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

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Main Content */}
        {isEditing ? (
          <div className="edit-form-container">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Sri Lanka"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself (max 500 characters)"
                maxLength="500"
                rows="4"
              />
              <span className="char-count">{formData.bio.length}/500</span>
            </div>

            <div className="form-group">
              <label>Interests</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="e.g., UI/UX Design, Web Development, Photography"
              />
              <p className="field-hint">Separate with commas</p>
            </div>

            <div className="form-group">
              <label>Avatar URL</label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <button className="save-btn" onClick={handleSaveProfile}>
              💾 Save Changes
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}