import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  Search,
  Bell,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalPosts: 0,
  });

  const [activities, setActivities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentsRes, pendingRes, allResourcesRes, postsRes, activitiesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/resources/pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/resources/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/posts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/admin/activities", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        const students = await studentsRes.json();
        const pending = await pendingRes.json();
        const allResources = await allResourcesRes.json();
        const postsData = await postsRes.json();
        const activitiesData = activitiesRes ? await activitiesRes.json() : [];

        const allResourcesArray = Array.isArray(allResources)
          ? allResources
          : Array.isArray(allResources.resources)
          ? allResources.resources
          : [];

        const approvedCount = allResourcesArray.filter(
          (r) => (r.status || "").toLowerCase() === "approved"
        ).length;

        const postsArray = Array.isArray(postsData)
          ? postsData
          : Array.isArray(postsData.posts)
          ? postsData.posts
          : [];

        const activitiesArray = Array.isArray(activitiesData)
          ? activitiesData
          : Array.isArray(activitiesData.activities)
          ? activitiesData.activities
          : [];

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
          totalPosts: postsArray.length,
        });

        setPosts(postsArray.slice(0, 5));
        setActivities(activitiesArray.slice(0, 5));
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
      color: "blue",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingResources,
      icon: Clock,
      color: "amber",
    },
    {
      title: "Approved Resources",
      value: stats.approvedResources,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "purple",
    },
  ];

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

          <button
            className="admin-user-mini"
            onClick={() => navigate("/admin-dashboard/profile")}
            type="button"
          >
            <span>Admin</span>
            <div className="admin-user-avatar">A</div>
          </button>
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
                      <div className="admin-stat-content">
                        <div className="admin-stat-icon-wrapper">
                          <div className={`admin-stat-icon ${card.color}`}>
                            <Icon size={24} />
                          </div>
                        </div>
                        <div className="admin-stat-info">
                          <p className="admin-stat-title">{card.title}</p>
                          <h3 className="admin-stat-value">{card.value}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="admin-overview-grid">
                {/* Recent Posts */}
                <div className="admin-overview-card">
                  <div className="overview-card-header">
                    <div>
                      <h3>Recent Posts</h3>
                      <p className="card-subtitle">Latest posts from students</p>
                    </div>
                    <button 
                      className="view-all-btn"
                      onClick={() => navigate("/admin-dashboard/posts")}
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="overview-card-content">
                    {posts.length > 0 ? (
                      <div className="posts-list">
                        {posts.map((post) => (
                          <div className="post-item" key={post._id}>
                            <div className="post-meta">
                              <h4>{post.title || "Untitled Post"}</h4>
                              <p className="post-author">
                                By {post.author?.name || "Anonymous"}
                              </p>
                            </div>
                            <div className="post-info">
                              <span className="post-date">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <FileText size={32} />
                        <p>No posts yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="admin-overview-card">
                  <div className="overview-card-header">
                    <div>
                      <h3>Recent Activities</h3>
                      <p className="card-subtitle">Platform activity feed</p>
                    </div>
                    <button className="view-all-btn">
                      View All <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="overview-card-content">
                    {activities.length > 0 ? (
                      <div className="activities-list">
                        {activities.map((activity) => (
                          <div className="activity-item-card" key={activity._id || Math.random()}>
                            <div className="activity-icon-bg">
                              <Activity size={16} />
                            </div>
                            <div className="activity-details">
                              <p className="activity-desc">{activity.description || "Activity"}</p>
                              <small className="activity-time">
                                {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <Activity size={32} />
                        <p>No activities yet</p>
                      </div>
                    )}
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