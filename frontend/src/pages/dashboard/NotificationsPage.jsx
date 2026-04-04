import { useEffect, useState } from "react";
import { getAuthToken } from "../../utils/authStorage";
import { apiUrl } from "../../config/api";
import "./dashboardPageShell.css";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");

    try {
      const authToken = getAuthToken();
      // “New alerts” = resources waiting approval.
      const headers = authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined;
      const res = await fetch(apiUrl("/api/admin/resources"), {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load notifications");
        setAlerts([]);
        return;
      }

      const pending = (Array.isArray(data) ? data : [])
        .filter((r) => String(r.status).toLowerCase() === "pending")
        .sort((a, b) => {
          const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bd - ad;
        });

      setAlerts(pending);
    } catch {
      setError("Server error while loading notifications");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-page-shell notifications-page">
      <div className="notifications-hero">
        <div className="notifications-hero-content">
          <h1>Notifications</h1>
          <p>New resource approvals and pending items will appear here.</p>
        </div>
      </div>

      <div className="notifications-body">
        {error && <div className="notifications-error">{error}</div>}

        {loading ? (
          <p className="notifications-loading">Loading...</p>
        ) : alerts.length === 0 ? (
          <div className="notifications-empty">
            <h3>No new alerts</h3>
            <p>All resources are currently approved or rejected.</p>
          </div>
        ) : (
          <div className="notifications-list">
            <div className="notifications-list-header">
              <span>New alerts</span>
              <span className="notifications-count">{alerts.length}</span>
            </div>

            {alerts.map((a) => (
              <div className="notification-card" key={a._id}>
                <div className="notification-title">{a.title}</div>
                <div className="notification-meta">
                  <span className="meta-item">Subject: {a.subject}</span>
                  <span className="meta-item">Status: {a.status}</span>
                </div>
                <div className="notification-description">{a.description}</div>
                <div className="notification-time">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notifications-actions">
          <button
            className="notifications-refresh"
            type="button"
            onClick={fetchAlerts}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

