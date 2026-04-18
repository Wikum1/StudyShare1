import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Save,
  Edit2,
  LogOut,
  Upload,
} from "lucide-react";
import "./AdminProfile.css";

export default function AdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      joinDate: userData.createdAt
        ? new Date(userData.createdAt).toLocaleDateString()
        : "Not available",
    });
    setLoading(false);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      const updatedUserData = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage("Error updating profile. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("File size must be less than 5MB");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("token");
    setUploadingAvatar(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profilePicture", selectedFile);

      const response = await fetch("http://localhost:5000/api/users/profile/picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const data = await response.json();
      const updatedUserData = {
        ...user,
        profilePicture: data.profilePicture,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setSelectedFile(null);
      setAvatarPreview(null);
      setMessage("Profile picture uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setMessage("Error uploading profile picture. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-shell">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="admin-profile-shell">
      <header className="profile-header">
        <button
          className="profile-back-btn"
          onClick={() => navigate("/admin-dashboard")}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1>Admin Profile</h1>

        <div className="profile-header-spacer"></div>
      </header>

      <div className="profile-container">
        {message && (
          <div
            className={`profile-message ${
              message.includes("Error") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Card */}
          <section className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-container">
                <div className="profile-avatar-large">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="profile-avatar-image" />
                  ) : user?.profilePicture ? (
                    <img
                      src={`http://localhost:5000${user.profilePicture}`}
                      alt={user?.name}
                      className="profile-avatar-image"
                    />
                  ) : (
                    <UserCircle size={60} />
                  )}
                </div>
                <button
                  type="button"
                  className="profile-avatar-upload-btn"
                  onClick={handleAvatarClick}
                  title="Click to change profile picture"
                >
                  <Upload size={16} />
                </button>
              </div>

              {avatarPreview && (
                <div className="profile-avatar-actions">
                  <button
                    type="button"
                    className="btn-upload-confirm"
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? "Uploading..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    className="btn-upload-cancel"
                    onClick={handleCancelUpload}
                    disabled={uploadingAvatar}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="profile-file-input"
                style={{ display: "none" }}
              />

              <div className="profile-avatar-info">
                <h2>{user?.name || "Admin"}</h2>
                <p className="profile-role">Administrator</p>
              </div>
            </div>

            <div className="profile-quick-stats">
              <div className="stat-item">
                <div className="stat-label">Role</div>
                <div className="stat-value">Admin</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Member Since</div>
                <div className="stat-value">{formData.joinDate}</div>
              </div>
            </div>
          </section>

          {/* Profile Details */}
          <section className="profile-details">
            <div className="profile-section-header">
              <h3>Profile Information</h3>
              <button
                className={`edit-btn ${isEditing ? "active" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 size={16} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">
                  <UserCircle size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="form-input disabled"
                  placeholder="Email (cannot be changed)"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your address"
                />
              </div>

              {/* Join Date */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Member Since
                </label>
                <input
                  type="text"
                  value={formData.joinDate}
                  disabled
                  className="form-input disabled"
                  placeholder="Join date"
                />
              </div>

              {/* Save Button */}
              {isEditing && (
                <button type="submit" className="btn-save">
                  <Save size={16} />
                  Save Changes
                </button>
              )}
            </form>
          </section>
        </div>

        {/* Danger Zone */}
        <section className="profile-danger-zone">
          <h3>Danger Zone</h3>
          <p>Once you logout, you will need to login again to access the admin panel.</p>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
