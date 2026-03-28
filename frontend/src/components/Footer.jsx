import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Footer.css";
import logo from "../assets/logo0.png";

export default function Footer() {

  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDay(1);
  };

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className={`lux-footer ${visible ? "is-visible" : ""}`}>

      {/* LEFT MENU */}
      <div className="lux-left-menu">
        <ul className="lux-left-list">
          <li><NavLink to="/" end className="lux-left-link">Home</NavLink></li>
          <li><NavLink to="/resources" className="lux-left-link">Resources</NavLink></li>
          <li><NavLink to="/planner" className="lux-left-link">Planner</NavLink></li>
          <li><NavLink to="/forum" className="lux-left-link">Forum</NavLink></li>
          <li><NavLink to="/admin" className="lux-left-link">Notifications</NavLink></li>
          <li><NavLink to="/contact" className="lux-left-link">Contacts</NavLink></li>
        </ul>
      </div>

      {/* WATERMARK */}
      <div className="lux-watermark">StudyShare</div>

      {/* ORBS */}
      <div className="lux-orb orb-1"></div>
      <div className="lux-orb orb-2"></div>
      <div className="lux-orb orb-3"></div>

      {/* CENTER CONTENT */}
      <div className="lux-footer-content">

  <div className="lux-logo">
    <img src={logo} alt="StudyShare Logo" />
  </div>
        <p className="lux-kicker">YOU'RE IN GOOD HANDS</p>

        <h1 className="lux-title">
          A quiet revolution against <br /> the chaos of email.
        </h1>

        <div className="lux-subscribe">
          <input type="email" placeholder="Email address" />
          <button>Join Waitlist</button>
        </div>

        <div className="lux-meta">

          <div className="lux-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>

          <div className="lux-social">
            <a href="https://instagram.com">📸</a>
            <a href="https://twitter.com">✖</a>
            <a href="mailto:info@studyshare.com">✉</a>
          </div>

        </div>

        <div className="lux-bottom">
          © 2026 <span>StudyShare</span> All Rights Reserved.
        </div>

      </div>

      {/* RIGHT CALENDAR */}

      <div className="lux-calendar">

        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>‹</button>

          <h3>
            {monthNames[month]} {year}
          </h3>

          <button onClick={() => changeMonth(1)}>›</button>
        </div>

        <div className="calendar-grid">

          {[...Array(daysInMonth)].map((_, i) => {

            const day = i + 1;

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            return (
              <div
                key={day}
                className={`day 
                  ${selectedDay === day ? "active-day" : ""} 
                  ${isToday ? "today" : ""}
                `}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </div>
            );
          })}

        </div>

        <div className="calendar-events">
          {selectedDay === 16 && <p>16 – Project Update</p>}
          {selectedDay === 18 && <p>18 – Launch Sync</p>}
          {selectedDay === 20 && <p>20 – Team Meeting</p>}
        </div>

      </div>

    </footer>
  );
}