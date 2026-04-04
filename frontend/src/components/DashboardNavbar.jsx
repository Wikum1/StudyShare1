import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./DashboardNavbar.css";
import logo from "../assets/logo.png";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="dashboard-navbar">
      {/* LEFT SIDE */}
      <div className="dashboard-left">
        <div className="dashboard-logo">
          <Link to="/">
            <img src={logo} alt="StudyShare Logo" />
      
          </Link>
        </div>

        <div className="dashboard-links">
          <NavLink 
            to="/dashboard" 
            end 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>

          <NavLink 
            to="/dashboard/wall" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Wall
          </NavLink>

          <NavLink 
            to="/dashboard/my-resources" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            My Resources
          </NavLink>

          <NavLink 
            to="/dashboard/study-planner" 
            className={({ isActive }) => `study-planner-link ${isActive ? 'active' : ''}`}
          >
            Study Planner
          </NavLink>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="dashboard-right">
        <div className="dashboard-user">
          👤 Student
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}