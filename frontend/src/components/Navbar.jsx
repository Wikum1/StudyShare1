import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";

import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        {/* Logo */}
<Link to="/" className="logo">
  <img src={logo} alt="StudyShare Logo" />
</Link>

        {/* Center Links */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/planner">Planner</NavLink>
          <NavLink to="/forum">Forum</NavLink>
          <NavLink to="/admin">Notifications</NavLink>
          <NavLink to="/contact">Contacts</NavLink>

          {/* <NavLink to="/notifications">Notifications</NavLink> */}
          {/* <NavLink to="/profile">Profile</NavLink> */}
        </div>

        {/* Right Side Button */}
        <div className="nav-right">
          <NavLink to="/login">
            <button className="get-started-btn">Get Started</button>
          </NavLink>
        </div>

        {/* Mobile Toggle */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </div>
    </nav>
  );
}
