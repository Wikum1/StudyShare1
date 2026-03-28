import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react"; // 🔥 NEW
import { ThemeContext } from "../context/ThemeContext"; // 🔥 NEW
import "./DashboardNavbar.css";
import logo from "../assets/logo.png";

export default function DashboardNavbar() {

  const navigate = useNavigate();

  // 🔥 GET THEME STATE
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
          <img src={logo} alt="StudyShare Logo" />
        </div>

        <div className="dashboard-links">

          <NavLink to="/dashboard" end>
            Dashboard
          </NavLink>

          <NavLink to="/dashboard/my-resources">
            My Resources
          </NavLink>

          <NavLink to="/dashboard/upload">
            Upload
          </NavLink>

          <NavLink to="/dashboard/study-planner">
            Study Planner
          </NavLink>

          <NavLink to="/dashboard/profile">
            Profile
          </NavLink>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="dashboard-right">

        {/* 🌙 DARK MODE BUTTON */}
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

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