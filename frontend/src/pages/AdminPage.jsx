import { Link } from "react-router-dom";
import "./AdminPage.css";
import adminImage from "../assets/admin & notification.jpg";

export default function AdminPage() {
  return (
    <div className="admin-page">

      {/* HERO SECTION */}
      <div className="admin-hero">
        <div className="admin-hero-content">
          <h1>🔔 Platform Notifications</h1>
          <p>
            Manage resource approvals, monitor platform activity and
            control system notifications across StudyShare.
          </p>
          <p className="admin-hero-admin-note">
            <strong>Administrators:</strong> Log in to view{" "}
            <strong>registered student accounts</strong> (created via the{" "}
            <Link to="/register">Register</Link> page) and their profiles — names,
            emails, and student details — in the admin dashboard.
          </p>

         <div className="hero-buttons">
            <Link to="/login">
              <button type="button" className="primary-btn">Admin login</button>
            </Link>
            <a href="/upload">
              <button type="button" className="secondary-btn">Upload (students)</button>
            </a>
            <a href="/contact">
              <button type="button" className="secondary-btn">Contact Us</button>
            </a>
          </div>
        </div>
      </div>


{/* ILLUSTRATION SECTION */}

<div className="admin-illustration">

  <div className="admin-text">

    <h2>⚙️ Manage the StudyShare Platform</h2>

    <p>
      The admin panel allows administrators to monitor platform activity,
      manage uploaded resources, and ensure that the system runs smoothly
      for all students.
    </p>

    <p>
      Administrators can approve shared materials, send announcements,
      manage users, and analyze platform performance to maintain a
      safe and productive academic environment.
    </p>

    <div className="admin-highlights">

      <div className="highlight-item">✅ Approve Shared Resources</div>
      <div className="highlight-item">📢 Send Platform Notifications</div>
      <div className="highlight-item">👥 Manage Users</div>
      <div className="highlight-item">📊 Monitor Platform Activity</div>

    </div>

  </div>

  <div className="admin-image">
    <img src={adminImage} alt="Admin dashboard management" />
  </div>

</div>


{/* FEATURES SECTION */}

<div className="admin-features">

  <div className="admin-card">
    <div className="admin-icon">✅</div>
    <h3>Resource Approvals</h3>
    <p>Review and approve uploaded academic materials.</p>
  </div>

  <div className="admin-card">
    <div className="admin-icon">📢</div>
    <h3>System Notifications</h3>
    <p>Send announcements and important updates to users.</p>
  </div>

  <div className="admin-card">
    <div className="admin-icon">👥</div>
    <h3>User Management</h3>
    <p>Monitor users and manage platform activities.</p>
  </div>

  <div className="admin-card">
    <div className="admin-icon">📊</div>
    <h3>Platform Insights</h3>
    <p>Track system activity and resource statistics.</p>
  </div>

</div>


{/* STATISTICS */}

<div className="admin-stats">

  <div className="stat-card">
    <h2>1200+</h2>
    <p>Resources Uploaded</p>
  </div>

  <div className="stat-card">
    <h2>600+</h2>
    <p>Active Users</p>
  </div>

  <div className="stat-card">
    <h2>300+</h2>
    <p>Resources Approved</p>
  </div>

  <div className="stat-card">
    <h2>50+</h2>
    <p>System Announcements</p>
  </div>

</div>

    </div>
  );
}