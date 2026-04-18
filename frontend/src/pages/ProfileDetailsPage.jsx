import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfileDetailsPage.css";

export default function ProfileDetailsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    joinDate: ""
  });

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
        email: response.data.user.email,
        phone: response.data.user.phoneNumber || "",
        bio: response.data.user.bio || "",
        location: response.data.user.location || "",
        joinDate: response.data.user.createdAt ? new Date(response.data.user.createdAt).toLocaleDateString() : ""
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/users/profile/edit`,
        {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          bio: formData.bio,
          location: formData.location
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
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
      <div className="profile-details-page">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-details-page">

      <div className="profile-details-container">
        {/* Header Actions */}
        <div className="profile-actions">
          <button className="btn-print" onClick={() => window.print()}>
            PRINT
          </button>
          <button 
            className="btn-edit" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "CANCEL" : "EDIT"}
          </button>
        </div>

        <div className="profile-content">
          {/* Left Sidebar */}
          <aside className="profile-sidebar">
            <div className="sidebar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-initials">{getInitials()}</div>
              )}
            </div>

            <div className="sidebar-info">
              <h2 className="user-name-sidebar">{user?.name}</h2>
              <p className="user-phone">
                📞 {user?.phoneNumber || "N/A"}
              </p>
              <p className="user-email-sidebar">
                {user?.email}
              </p>
            </div>

            {/* Activity Tabs */}
            <nav className="activity-tabs">
              <button 
                className={`activity-tab ${activeTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming (2)
              </button>
              <button 
                className={`activity-tab ${activeTab === "past" ? "active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past (8)
              </button>
              <button 
                className={`activity-tab ${activeTab === "planned" ? "active" : ""}`}
                onClick={() => setActiveTab("planned")}
              >
                Planned
              </button>
            </nav>

            {/* Activity Timeline */}
            <div className="activity-timeline">
              {activeTab === "upcoming" && (
                <>
                  <div className="timeline-item upcoming">
                    <div className="timeline-date">11:00-12:00</div>
                    <div className="timeline-header">26 May 2025</div>
                    <div className="timeline-content">
                      <p className="activity-type">Service</p>
                      <p className="activity-title">Cleaning and cleaning of canals</p>
                      <span className="status-badge">Scheduled</span>
                    </div>
                  </div>

                  <div className="timeline-item upcoming">
                    <div className="timeline-date">14:30-15:30</div>
                    <div className="timeline-header">27 Dec 2023</div>
                    <div className="timeline-content">
                      <p className="activity-type">Service</p>
                      <p className="activity-title">Teeth whitening</p>
                      <span className="status-badge">Scheduled</span>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "past" && (
                <div className="timeline-item past">
                  <p className="activity-type">Service</p>
                  <p className="activity-title">Previous activities and completed services</p>
                </div>
              )}
              {activeTab === "planned" && (
                <div className="timeline-item">
                  <p className="activity-type">Service</p>
                  <p className="activity-title">Planned treatments</p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            {/* Information Sections */}
            <div className="info-sections">
              {/* General Information */}
              <section className="info-section">
                <h3 className="section-title">
                  General information
                  {!isEditing && <span className="edit-icon">✏️</span>}
                </h3>

                {isEditing ? (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />

                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />

                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                    />

                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Bio"
                      rows="3"
                    />

                    <button className="btn-save-changes" onClick={handleSave}>
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="info-display">
                    <div className="info-row">
                      <label>Full Name:</label>
                      <span>{user?.name}</span>
                    </div>
                    <div className="info-row">
                      <label>Email:</label>
                      <span>{user?.email}</span>
                    </div>
                    <div className="info-row">
                      <label>Phone Number:</label>
                      <span>{user?.phoneNumber || "Not provided"}</span>
                    </div>
                    <div className="info-row">
                      <label>Location:</label>
                      <span>{user?.location || "Not provided"}</span>
                    </div>
                    <div className="info-row">
                      <label>Member Since:</label>
                      <span>{formData.joinDate}</span>
                    </div>
                    <div className="info-row">
                      <label>Bio:</label>
                      <span>{user?.bio || "No bio added"}</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Bio/Additional Info */}
              <section className="info-section">
                <h3 className="section-title">
                  About
                  {!isEditing && <span className="edit-icon">✏️</span>}
                </h3>

                <div className="info-display">
                  <div className="info-row">
                    <label>Role:</label>
                    <span className="role-badge">{user?.role || "Student"}</span>
                  </div>
                  <div className="info-row">
                    <label>Account Status:</label>
                    <span className="status-active">Active</span>
                  </div>
                  <div className="info-row">
                    <label>Interests:</label>
                    <span>{user?.interests || "Not specified"}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Files Section */}
            <section className="files-section">
              <div className="section-header">
                <h3 className="section-title">Files</h3>
                <button className="btn-download-all">⬇️ DOWNLOAD</button>
              </div>

              <div className="files-list">
                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">Profile Summary.pdf</p>
                    <p className="file-size">125 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>

                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">Academic Records.pdf</p>
                    <p className="file-size">245 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>

                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">Certificates.pdf</p>
                    <p className="file-size">189 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>

                <div className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">Contact Information.pdf</p>
                    <p className="file-size">98 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="notes-section">
              <div className="section-header">
                <h3 className="section-title">Notes</h3>
                <button className="btn-download-all">⬇️ DOWNLOAD</button>
              </div>

              <div className="notes-list">
                <div className="note-item">
                  <div className="note-icon">📝</div>
                  <div className="note-info">
                    <p className="note-name">Course Progress Notes.pdf</p>
                    <p className="note-size">156 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>

                <div className="note-item">
                  <div className="note-icon">📝</div>
                  <div className="note-info">
                    <p className="note-name">Personal Development Notes.pdf</p>
                    <p className="note-size">203 kb</p>
                  </div>
                  <button className="btn-file-download" title="Download">⬇️</button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
