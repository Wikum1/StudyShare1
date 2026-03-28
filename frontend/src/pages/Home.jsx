import { useState } from "react";
import "./Home.css";

import resourceImg from "../assets/resource.jpg";
import plannerImg from "../assets/planner.jpg";
import forumImg from "../assets/forum.jpg";
import adminImg from "../assets/admin.jpg";
import featuredImg from "../assets/featured.jpg";

import blog1 from "../assets/blog1.jpg";
import blog2 from "../assets/blog2.jpg";
import blog3 from "../assets/blog3.jpg";

import heroVideo from "../assets/hero-video.mp4";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/contact/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      alert(data.message || "Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      alert("Failed to send message");
    }
  };

  return (
    <div className="home">
      {/* HERO SECTION */}
      <div className="hero">

        {/* Background Video */}
 <video autoPlay muted loop playsInline className="hero-video">
    <source src={heroVideo} type="video/mp4" />
  </video>

  {/* Overlay */}
  <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Student Resource Sharing & Study Planner</h1>
          <p>
            Upload notes, organize your study plans, and collaborate with fellow
            students in one smart academic platform.
          </p>

          <div className="hero-buttons">
            <a href="/upload">
              <button className="primary-btn">Get Started</button>
            </a>
            <a href="/contact">
              <button className="secondary-btn">Contact Us</button>
            </a>
          </div>
        </div>
      </div>

     {/* FEATURES SECTION */}
<div className="features-section">

  <h2 className="features-title">Our Platform Features</h2>
  <p className="features-subtitle">
    Everything you need to manage your academic journey in one place.
  </p>

  <div className="features">

    <div className="feature-card">
      <h2>Resource Sharing</h2>
      <img src={resourceImg} alt="Resource Sharing" />
      <p>Upload PDFs, Word documents and videos easily.</p>
      <a href="/resources">
        <button>Explore</button>
      </a>
    </div>

    <div className="feature-card">
      <h2>Study Planner</h2>
      <img src={plannerImg} alt="Study Planner" />
      <p>Organize and track your academic schedule.</p>
      <a href="/planner">
        <button>Explore</button>
      </a>
    </div>

    <div className="feature-card">
      <h2>Discussion Forum</h2>
      <img src={forumImg} alt="Discussion Forum" />
      <p>Ask questions and collaborate with peers.</p>
      <a href="/forum">
        <button>Explore</button>
      </a>
    </div>

    <div className="feature-card">
      <h2>Notifications</h2>
      <img src={adminImg} alt="Admin Dashboard" />
      <p>Manage approvals and system notifications.</p>
      <a href="/admin">
        <button>Explore</button>
      </a>
    </div>

  </div>
</div>

      {/* ================= LATEST BLOGS ================= */}
      <div className="latest-blogs">
        <div className="blogs-container">
          <div className="blog-list">
            <h2>Latest Blogs</h2>

            <div className="blog-item">
              <img src={blog1} alt="blog" />
              <div>
                <h4>How to Study Smart in University</h4>
                <span className="blog-date">March 3, 2026</span>
                <p>
                  Learn effective study techniques to boost academic
                  performance...
                </p>
              </div>
            </div>

            <div className="blog-item">
              <img src={blog2} alt="blog" />
              <div>
                <h4>Top 5 Time Management Tips</h4>
                <span className="blog-date">March 1, 2026</span>
                <p>
                  Manage your study schedule efficiently using these proven
                  tips...
                </p>
              </div>
            </div>

            <div className="blog-item">
              <img src={blog3} alt="blog" />
              <div>
                <h4>Why Collaboration Improves Learning</h4>
                <span className="blog-date">February 28, 2026</span>
                <p>Discover how group discussions improve understanding...</p>
              </div>
            </div>
          </div>

          <div className="blog-featured">
            <img src={featuredImg} alt="Featured Blog" />
          </div>
        </div>
      </div>

      {/* ================= PREMIUM STATS SECTION ================= */}
      <div className="stats-section">
        <p className="stats-subtitle">YOU'RE IN GOOD HANDS</p>

        <div className="stats-container">
          <div className="stat-box">
            <h2>150+</h2>
            <p>Resources Shared</p>
          </div>

          <div className="stat-box">
            <h2>300+</h2>
            <p>Active Students</p>
          </div>

          <div className="stat-box">
            <h2>50+</h2>
            <p>Discussions Created</p>
          </div>
        </div>
      </div>

      {/* ================= CONTACT SECTION ================= */}
      <div id="contact" className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Contact Us</h2>
            <p>
              Have questions about our platform? Reach out and we’ll get back to
              you as soon as possible.
            </p>

            <div className="contact-details">
              <p>📧 support@studyshare.com</p>
              <p>📞 +94 71 234 5678</p>
              <p>📍 Colombo, Sri Lanka</p>
            </div>
          </div>

          <div className="contact-form">
            <form action="https://formspree.io/f/meelyzqp" method="POST">
              <input type="text" name="name" placeholder="Full Name" required />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
              />

              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                required
              ></textarea>

              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
