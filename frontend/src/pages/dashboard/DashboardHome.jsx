import { useEffect, useState } from "react";
import {
  UploadCloud,
  Calendar,
  Sparkles,
  Files,
  CheckCircle,
  CalendarDays,
  Clock,
  BookOpen,
  MessageSquare,
  Folder,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { getPlans } from "../../services/studyPlanService";
import StudyPlansOverview from "../../components/StudyPlansOverview";
import "./DashboardHome.css";

export default function DashboardHome() {
  const [greeting, setGreeting] = useState("Welcome");
  const [stats, setStats] = useState({
    totalResources: 0,
    approvedFiles: 0,
    studyPlans: 0,
    pendingReviews: 0,
    studyPlansProgress: 0,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch study plans
        const response = await getPlans();
        
        // Handle different response structures
        let plans = [];
        if (Array.isArray(response)) {
          plans = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          plans = response.data;
        } else if (response && Array.isArray(response)) {
          plans = response;
        }
        
        // Calculate study plans stats
        let totalPlans = plans.length;
        let completedPlansCount = 0;
        
        // Calculate overall progress across all plans
        if (plans.length > 0) {
          for (const plan of plans) {
            if (plan.tasks && plan.tasks.length > 0) {
              const completedTasks = plan.tasks.filter(t => t.status === "completed").length;
              if (completedTasks === plan.tasks.length) {
                completedPlansCount++;
              }
            }
          }
        }

        const plansProgress = totalPlans > 0 
          ? Math.round((completedPlansCount / totalPlans) * 100)
          : 0;

        // Update stats with dynamic data
        setStats({
          totalResources: 24, // Placeholder - fetch from backend if needed
          approvedFiles: 18, // Placeholder
          studyPlans: totalPlans,
          pendingReviews: 6, // Placeholder
          studyPlansProgress: plansProgress,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set default stats on error
        setStats(prev => ({
          ...prev,
          studyPlans: 0,
          studyPlansProgress: 0,
        }));
      }
    };

    fetchStats();
  }, []);

  const capabilities = [
    { text: "Upload study materials", color: "indigo" },
    { text: "Create personal study plans", color: "emerald" },
    { text: "Track resource approval status", color: "amber" },
    { text: "Access shared academic content", color: "violet" },
    { text: "Engage with the student wall", color: "rose" },
  ];

  const quickStats = [
    {
      title: "Uploaded Resources",
      value: stats.totalResources.toString().padStart(2, "0"),
      note: "Notes, PDFs, videos",
      icon: <Files size={24} />,
      color: "indigo",
      progress: `${Math.min(stats.totalResources * 3.33, 100)}%`,
    },
    {
      title: "Approved Files",
      value: stats.approvedFiles.toString().padStart(2, "0"),
      note: "Visible to other students",
      icon: <CheckCircle size={24} />,
      color: "emerald",
      progress: `${Math.min(stats.approvedFiles * 5.55, 100)}%`,
    },
    {
      title: "Study Plans",
      value: stats.studyPlans.toString().padStart(2, "0"),
      note: "Active planner schedules",
      icon: <CalendarDays size={24} />,
      color: "violet",
      progress: `${stats.studyPlansProgress}%`,
      subtext: `${stats.studyPlansProgress}% Completed`,
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews.toString().padStart(2, "0"),
      note: "Waiting for approval",
      icon: <Clock size={24} />,
      color: "amber",
      progress: `${Math.min(stats.pendingReviews * 4.16, 100)}%`,
    },
  ];

  const features = [
    {
      icon: <BookOpen size={28} />,
      title: "Resource Sharing",
      text: "Upload lecture notes, tutorials, PDFs, and videos to build a shared learning space for students.",
      color: "indigo",
      large: true,
    },
    {
      icon: <Calendar size={28} />,
      title: "Study Planner",
      text: "Organize your daily, weekly, and monthly study tasks with reminders and structured planning tools.",
      color: "emerald",
      wide: true,
    },
    {
      icon: <MessageSquare size={28} />,
      title: "Student Wall",
      text: "Engage with the student community, share updates, ask questions, and interact with peers in one place.",
      color: "violet",
    },
    {
      icon: <Folder size={28} />,
      title: "My Resources",
      text: "Track all your uploaded files, check approval status, and manage documents or videos easily.",
      color: "amber",
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Progress Tracking",
      text: "Monitor your study activities, planner completion, and overall learning consistency over time.",
      color: "rose",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Safe Access",
      text: "Access your personal dashboard securely and manage your academic content in one organized system.",
      color: "cyan",
    },
  ];

  const quickActions = [
    {
      title: "Upload New Resource",
      desc: "Share notes, documents, and videos with other students.",
      link: "/dashboard/upload",
      color: "indigo",
    },
    {
      title: "Open Study Planner",
      desc: "Create study plans, tasks, and reminders for your learning routine.",
      link: "/dashboard/study-planner",
      color: "emerald",
    },
    {
      title: "View My Resources",
      desc: "Check your uploaded files, approval status, and downloads.",
      link: "/dashboard/my-resources",
      color: "amber",
    },
  ];

  return (
    <div className="student-dashboard-shell">
      <div className="dashboard-grid-overlay"></div>

      <div className="dashboard-home-wrapper">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-orb hero-orb-left"></div>
          <div className="hero-orb hero-orb-right"></div>
          <div className="hero-orb hero-orb-center"></div>

          <div className="hero-grid">
            <div className="hero-main">
              <div className="hero-badge">
                <Sparkles size={16} />
                {greeting}
              </div>

              <h1 className="hero-title">
                Your Academic <span>Dashboard</span>
              </h1>

              <p className="hero-text">
                Manage your learning journey with resource sharing, study
                planning, progress tracking, and student collaboration — all in
                one smart academic workspace.
              </p>

              <div className="hero-actions">
                <a href="/dashboard/upload" className="hero-btn hero-btn-primary">
                  <UploadCloud size={18} />
                  Upload Resource
                </a>

                <a
                  href="/dashboard/study-planner"
                  className="hero-btn hero-btn-secondary"
                >
                  <Calendar size={18} />
                  Open Planner
                </a>
              </div>
            </div>

            <div className="hero-side">
              <h3>What you can do here</h3>
              <div className="capabilities-list">
                {capabilities.map((cap) => (
                  <div className="capability-item" key={cap.text}>
                    <span className={`cap-dot ${cap.color}`}></span>
                    <span>{cap.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div className="section-bar indigo-bar"></div>
            <h2>Overview</h2>
          </div>

          <div className="stats-grid">
            {quickStats.map((stat) => (
              <div className={`stat-card ${stat.color}`} key={stat.title}>
                <div className="stat-top">
                  <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                  <h3 className={`stat-number ${stat.color}`}>{stat.value}</h3>
                </div>

                <div className="stat-bottom">
                  <h4>{stat.title}</h4>
                  <p>{stat.note}</p>

                  {stat.subtext && (
                    <div className="stat-subtext">{stat.subtext}</div>
                  )}

                  <div className="stat-progress-track">
                    <div
                      className={`stat-progress-fill ${stat.color}`}
                      style={{ width: stat.progress }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div className="section-bar emerald-bar"></div>
            <h2>Student Features</h2>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div
                className={`feature-card ${feature.color} ${
                  feature.large ? "feature-large" : ""
                } ${feature.wide ? "feature-wide" : ""}`}
                key={feature.title}
              >
                <div className="feature-arrow">
                  <ArrowUpRight size={22} />
                </div>

                <div className={`feature-icon ${feature.color}`}>
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div className="section-bar amber-bar"></div>
            <h2>Quick Actions</h2>
          </div>

          <div className="actions-grid">
            {quickActions.map((action) => (
              <a
                href={action.link}
                className={`action-card ${action.color}`}
                key={action.title}
              >
                <div className={`action-accent ${action.color}`}></div>

                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>

                  <div className="action-footer">
                    <span>Get Started</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* STUDY PLANS OVERVIEW */}
        <StudyPlansOverview />
      </div>
    </div>
  );
}