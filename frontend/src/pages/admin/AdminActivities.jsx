import { useEffect, useState } from "react";

export default function AdminActivities() {
  const token = localStorage.getItem("token");
  const [activities, setActivities] = useState([]);

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
      }
    };

    loadActivities();
  }, [token]);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Activities</h1>
        <p>Track recent platform actions.</p>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-item">No activities found</div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="activity-item">
              {activity.text || activity.message || activity}
            </div>
          ))
        )}
      </div>
    </div>
  );
}