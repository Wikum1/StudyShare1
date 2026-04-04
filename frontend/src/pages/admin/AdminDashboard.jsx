import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalActivities: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsRes, pendingRes, allResourcesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/students", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/admin/resources/pending", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/admin/resources/all", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const students = await studentsRes.json();
        const pending = await pendingRes.json();
        const allResources = await allResourcesRes.json();

        const approvedCount = Array.isArray(allResources)
          ? allResources.filter((r) => r.status === "Approved").length
          : 0;

        setStats({
          totalStudents: Array.isArray(students) ? students.length : 0,
          pendingResources: Array.isArray(pending) ? pending.length : 0,
          approvedResources: approvedCount,
          totalActivities: 4
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();
  }, [token]);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Overview</h1>
        <p>Monitor the StudyShare platform from one place.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Total Students</p>
        </div>

        <div className="stat-card">
          <h3>{stats.pendingResources}</h3>
          <p>Pending Resources</p>
        </div>

        <div className="stat-card">
          <h3>{stats.approvedResources}</h3>
          <p>Approved Resources</p>
        </div>

        <div className="stat-card">
          <h3>{stats.totalActivities}</h3>
          <p>Recent Activities</p>
        </div>
      </div>
    </div>
  );
}