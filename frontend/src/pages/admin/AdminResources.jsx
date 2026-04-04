import { useEffect, useState } from "react";

export default function AdminResources() {
  const token = localStorage.getItem("token");
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState("");

  const loadPendingResources = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/resources/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPendingResources();
  }, [token]);

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

      setMessage("Resource approved successfully");
      loadPendingResources();
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

      setMessage("Resource rejected successfully");
      loadPendingResources();
    } catch (err) {
      setMessage("Server error while rejecting resource");
    }
  };

  const getFileUrl = (path) => {
    if (!path) return "#";
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Resources</h1>
        <p>Approve or reject uploaded study resources.</p>
      </div>

      {message && <div className="admin-alert">{message}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Status</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan="5">No pending resources</td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource._id}>
                  <td>{resource.title}</td>
                  <td>{resource.subject}</td>
                  <td>{resource.status}</td>
                  <td>
                    <a href={getFileUrl(resource.fileUrl)} target="_blank" rel="noreferrer">
                      View File
                    </a>
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}