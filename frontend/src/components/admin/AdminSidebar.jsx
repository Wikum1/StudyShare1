import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  FileText,
  LogOut,
} from "lucide-react";

import "./AdminSidebar.css";

const navItems = [
  { path: "/admin-dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { path: "/admin-dashboard/students", label: "Students", icon: Users },
  { path: "/admin-dashboard/resources", label: "Resources", icon: BookOpen },
  { path: "/admin-dashboard/activities", label: "Activities", icon: Activity, badge: true },
  { path: "/admin-dashboard/posts", label: "Posts", icon: FileText },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-top">
          
          {/* LOGO */}
          <div className="admin-logo-wrapper">
            <div className="admin-logo-dot-container">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="admin-logo-dot-glow"
              />
              <div className="admin-logo-dot" />
            </div>

            <div>
              <h2 className="admin-logo-text">StudyShare Admin</h2>
              <p className="admin-logo-subtitle">Management Portal</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="admin-nav">
            {navItems.map((item, index) => {
              const isActive = item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `admin-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeNavBg"
                          className="admin-nav-active-bg"
                        />
                        <motion.div
                          layoutId="activeIndicator"
                          className="admin-nav-active-indicator"
                        />
                      </>
                    )}

                    <item.icon size={18} className="admin-nav-icon" />
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className="admin-badge">
                        <span className="admin-badge-ping" />
                        <span className="admin-badge-dot" />
                      </span>
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="admin-sidebar-bottom">
        <div className="admin-user-card">
          <div className="admin-user-avatar">AD</div>
          <div>
            <h4 className="admin-user-name">Admin</h4>
            <p className="admin-user-role">Super Admin</p>
          </div>
        </div>

        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}