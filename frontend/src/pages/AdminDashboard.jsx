import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/admin/resources/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load pending resources");
        return;
      }

      setResources(data);
    } catch (err) {
      setMessage("Server error while fetching resources");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/resources/approve/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Approve failed");
        return;
      }

      setResources((prev) => prev.filter((item) => item._id !== id));
      setMessage("Resource approved successfully");
    } catch (err) {
      setMessage("Server error while approving resource");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/resources/reject/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Reject failed");
        return;
      }

      setResources((prev) => prev.filter((item) => item._id !== id));
      setMessage("Resource rejected successfully");
    } catch (err) {
      setMessage("Server error while rejecting resource");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Review uploaded resources and approve or reject them.</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {loading ? (
          <p className="admin-loading">Loading pending resources...</p>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <h3>No pending resources</h3>
            <p>All uploaded resources have been reviewed.</p>
          </div>
        ) : (
          <div className="admin-resource-grid">
            {resources.map((resource) => (
              <div className="admin-resource-card" key={resource._id}>
                <div className="card-top">
                  <h3>{resource.title}</h3>
                  <p className="subject">Subject: {resource.subject}</p>
                  <p className="description">{resource.description}</p>
                  <span className="pending-badge">{resource.status}</span>
                </div>

                <div className="card-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(resource._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => handleReject(resource._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}