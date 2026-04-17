import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setUser(response.data.user);
      setSuccess("Avatar uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setError("Failed to upload avatar");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-wrapper"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            {/* Avatar */}
            <div className="avatar-box">
              <div className="avatar-wrapper">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className="avatar-initials">{getInitials()}</div>
                )}
                <label htmlFor="avatar-upload" className="avatar-upload">
                  <span>+</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>

            {/* User Details */}
            <div className="profile-details">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">FOLLOWERS</span>
              <span className="stat-count">{user?.followers?.length || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">FOLLOWING</span>
              <span className="stat-count">{user?.following?.length || 0}</span>
            </div>
          </div>

          {/* Edit Button */}
          <button 
            className="btn-edit"
            onClick={() => navigate("/dashboard/profile-details")}
          >
            ✏️ Edit Profile
          </button>

          {/* Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </div>
      </div>
    </div>
  );
}
