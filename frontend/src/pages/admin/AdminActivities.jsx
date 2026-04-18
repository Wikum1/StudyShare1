import { useEffect, useState } from "react";
import "./AdminActivities.css";

export default function AdminActivities() {
  const token = localStorage.getItem("token");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/activities", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [token]);

  return (
    <div className="admin-activities-page">
      {/* HEADER */}
      <div className="admin-header">
        <h1>Recent Activities</h1>
        <p>Track what’s happening across the platform</p>
      </div>

      {/* CONTENT */}
      <div className="activity-container">
        {loading ? (
          <div className="activity-empty">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="activity-empty">
            <h3>No activities yet</h3>
            <p>System activity will appear here</p>
          </div>
        ) : (
          <div className="timeline">
            {activities.map((activity, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot" />

                <div className="timeline-content">
                  <p className="activity-text">
                    {activity.text || activity.message || activity}
                  </p>

                  <span className="activity-time">
                    {activity.time
                      ? new Date(activity.time).toLocaleString()
                      : "Just now"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}