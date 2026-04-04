import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  Download,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Upload,
  UserPlus,
  AlertCircle,
  Trophy,
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalDownloads: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsRes, pendingRes, allResourcesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/resources/pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/resources/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const students = await studentsRes.json();
        const pending = await pendingRes.json();
        const allResources = await allResourcesRes.json();

        const allResourcesArray = Array.isArray(allResources)
          ? allResources
          : Array.isArray(allResources.resources)
          ? allResources.resources
          : [];

        const approvedCount = allResourcesArray.filter(
          (r) => (r.status || "").toLowerCase() === "approved"
        ).length;

        setStats({
          totalStudents: Array.isArray(students)
            ? students.length
            : Array.isArray(students.students)
            ? students.students.length
            : 0,
          pendingResources: Array.isArray(pending)
            ? pending.length
            : Array.isArray(pending.resources)
            ? pending.resources.length
            : 0,
          approvedResources: approvedCount,
          totalDownloads: approvedCount * 14,
        });
      } catch (err) {
        console.error("Dashboard stats load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [token]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      trend: "+12%",
      positive: true,
      color: "blue",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingResources,
      icon: Clock,
      trend: `${stats.pendingResources} waiting`,
      positive: false,
      color: "amber",
    },
    {
      title: "Approved Resources",
      value: stats.approvedResources,
      icon: CheckCircle,
      trend: "+8%",
      positive: true,
      color: "green",
    },
    {
      title: "Total Downloads",
      value: stats.totalDownloads,
      icon: Download,
      trend: "+24%",
      positive: true,
      color: "purple",
    },
  ];

  const uploadsData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 180 },
    { month: "Mar", value: 240 },
    { month: "Apr", value: 210 },
    { month: "May", value: 290 },
    { month: "Jun", value: stats.approvedResources + stats.pendingResources || 160 },
  ];

  const subjectData = [
    { label: "Mathematics", value: 30, color: "#3b82f6" },
    { label: "Science", value: 25, color: "#10b981" },
    { label: "English", value: 20, color: "#8b5cf6" },
    { label: "History", value: 15, color: "#f59e0b" },
    { label: "Other", value: 10, color: "#64748b" },
  ];

  const activities = [
    {
      id: 1,
      user: "Student User",
      action: "uploaded",
      target: "Calculus Notes",
      time: "2 min ago",
      icon: Upload,
      color: "blue",
      avatar: "SU",
    },
    {
      id: 2,
      user: "Admin",
      action: "approved",
      target: "Physics Resource",
      time: "1 hour ago",
      icon: CheckCircle,
      color: "green",
      avatar: "AD",
    },
    {
      id: 3,
      user: "New Student",
      action: "registered",
      target: "to the platform",
      time: "3 hours ago",
      icon: UserPlus,
      color: "purple",
      avatar: "NS",
    },
    {
      id: 4,
      user: "System",
      action: "flagged",
      target: "a resource for review",
      time: "5 hours ago",
      icon: AlertCircle,
      color: "amber",
      avatar: "SY",
    },
  ];

  const contributors = [
    { id: 1, name: "Alex Perera", uploads: 142 },
    { id: 2, name: "Nethmi Silva", uploads: 128 },
    { id: 3, name: "Lasindu Fernando", uploads: 95 },
    { id: 4, name: "Sajini Kumar", uploads: 84 },
    { id: 5, name: "Ravindu Jay", uploads: 67 },
  ];

  const maxUploads = contributors[0]?.uploads || 1;
  const maxUploadValue = Math.max(...uploadsData.map((d) => d.value), 1);

  return (
    <div className="admin-dashboard-shell">
      <header className="admin-top-header">
        <div className="admin-header-left">
          <div className="admin-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search students, resources, or subjects..."
            />
          </div>
        </div>

        <div className="admin-header-right">
          <button className="admin-notify-btn" type="button">
            <Bell size={18} />
            <span className="notify-dot"></span>
          </button>

          <div className="admin-divider"></div>

          <div className="admin-user-mini">
            <span>Admin</span>
            <div className="admin-user-avatar">A</div>
          </div>
        </div>
      </header>

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          <section className="admin-welcome-banner">
            <div className="banner-glow banner-glow-one"></div>
            <div className="banner-glow banner-glow-two"></div>

            <div className="admin-welcome-content">
              <p className="admin-date">{currentDate}</p>
              <h1>Welcome back, Admin! 👋</h1>
              <p className="admin-welcome-text">
                The platform is looking healthy today. You have{" "}
                <span>{stats.pendingResources} pending resources</span> that need
                your review.
              </p>
            </div>
          </section>

          {loading ? (
            <div className="admin-dashboard-loading">Loading dashboard...</div>
          ) : (
            <>
              <section className="admin-stats-grid">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div className="admin-stat-card" key={card.title}>
                      <div className={`stat-side-line ${card.color}`}></div>

                      <div className="admin-stat-top">
                        <div>
                          <p className="admin-stat-title">{card.title}</p>
                          <h3 className="admin-stat-value">{card.value}</h3>
                        </div>

                        <div className={`admin-stat-icon ${card.color}`}>
                          <Icon size={24} />
                        </div>
                      </div>

                      <div className="admin-stat-bottom">
                        <div
                          className={`admin-stat-trend ${
                            card.positive ? "positive" : "negative"
                          }`}
                        >
                          {card.positive ? (
                            <TrendingUp size={15} />
                          ) : (
                            <TrendingDown size={15} />
                          )}
                          <span>{card.trend}</span>
                        </div>

                        <span className="admin-stat-note">vs last month</span>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="admin-chart-grid">
                <div className="admin-chart-card uploads-chart-card">
                  <div className="card-head-row">
                    <h3>Resource Uploads Over Time</h3>
                    <select>
                      <option>Last 6 Months</option>
                      <option>This Year</option>
                    </select>
                  </div>

                  <div className="custom-bar-chart">
                    <div className="chart-y-labels">
                      <span>900</span>
                      <span>700</span>
                      <span>500</span>
                      <span>300</span>
                      <span>100</span>
                    </div>

                    <div className="chart-bars-area">
                      <div className="chart-grid-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>

                      <div className="chart-bars">
                        {uploadsData.map((item) => (
                          <div className="chart-bar-group" key={item.month}>
                            <div
                              className="chart-bar"
                              style={{
                                height: `${(item.value / maxUploadValue) * 100}%`,
                              }}
                            ></div>
                            <span>{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-chart-card subject-chart-card">
                  <h3>Resources by Subject</h3>

                  <div className="subject-donut-wrap">
                    <div className="fake-donut-chart"></div>

                    <div className="subject-legend">
                      {subjectData.map((item) => (
                        <div className="legend-item" key={item.label}>
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="legend-label">{item.label}</span>
                          <span className="legend-value">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="admin-bottom-grid">
                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <h3>Recent Activity</h3>
                    <button type="button">View All</button>
                  </div>

                  <div className="activity-list">
                    {activities.map((activity, index) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div
                          className={`activity-item ${
                            index !== activities.length - 1 ? "with-border" : ""
                          }`}
                          key={activity.id}
                        >
                          <div className="activity-avatar-wrap">
                            <div className="activity-avatar">
                              {activity.avatar}
                            </div>
                            <div className={`activity-icon-badge ${activity.color}`}>
                              <ActivityIcon size={11} />
                            </div>
                          </div>

                          <div className="activity-content">
                            <p>
                              <span className="user-name">{activity.user}</span>{" "}
                              <span className="action-text">{activity.action}</span>{" "}
                              <span className="target-text">{activity.target}</span>
                            </p>
                            <small>{activity.time}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="panel-card-header">
                    <h3 className="with-icon">
                      <Trophy size={18} />
                      Top Contributors
                    </h3>
                  </div>

                  <div className="contributors-list">
                    {contributors.map((user, index) => {
                      const progress = (user.uploads / maxUploads) * 100;

                      return (
                        <div className="contributor-item" key={user.id}>
                          <div className={`rank-badge rank-${index + 1}`}>
                            {index + 1}
                          </div>

                          <div className="contributor-avatar">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div className="contributor-info">
                            <div className="contributor-top">
                              <p>{user.name}</p>
                              <span>{user.uploads}</span>
                            </div>

                            <div className="contributor-progress-track">
                              <div
                                className="contributor-progress-fill"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}