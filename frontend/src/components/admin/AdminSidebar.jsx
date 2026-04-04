import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div>
        <h2 className="admin-logo">StudyShare Admin</h2>

        <nav className="admin-menu">
          <NavLink to="/admin-dashboard" end>
            Overview
          </NavLink>

          <NavLink to="/admin-dashboard/students">
            Students
          </NavLink>

          <NavLink to="/admin-dashboard/resources">
            Resources
          </NavLink>

          <NavLink to="/admin-dashboard/activities">
            Activities
          </NavLink>
        </nav>
      </div>

      <button className="admin-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}