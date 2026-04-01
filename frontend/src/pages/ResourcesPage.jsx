import "./ResourcesPage.css";
import studyImage from "../assets/study-sharing.jpg";

export default function ResourcesPage() {
  return (
    <div className="resources-page">
      {/* HERO SECTION */}
      <div className="resources-hero">
        <div className="resources-hero-content">
          <h1>Resource Sharing</h1>
          <p>
            Upload, manage and access academic materials including PDFs, Word
            documents and videos in one smart platform.
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

  {/* ILLUSTRATION SECTION */}
<div className="resource-illustration">

  <div className="illustration-text">

    <h2>📚 Study Smarter Together</h2>

    <p className="illustration-desc">
      StudyShare creates a collaborative learning environment where students
      can exchange knowledge, share study materials, and support each other’s
      academic success. Instead of searching through multiple platforms or
      emails, StudyShare keeps everything organized in one smart system.
    </p>

    <p className="illustration-desc">
      Students can upload lecture notes, assignments, research materials,
      tutorials, and videos. This makes learning easier and faster by giving
      everyone access to useful academic resources created by their peers.
    </p>

    {/* feature highlights */}
    <div className="illustration-features">

      <div className="feature-item">
        📂 Centralized Resource Library
      </div>

      <div className="feature-item">
        🤝 Collaborative Learning
      </div>

      <div className="feature-item">
        ⚡ Instant Access to Study Materials
      </div>

      <div className="feature-item">
        🎓 Community Knowledge Sharing
      </div>

    </div>

  </div>

  <div className="illustration-image">
    <img src={studyImage} alt="Students sharing resources" />
  </div>

</div>

      {/* FEATURES SECTION */}
<div className="resource-features">

  <div className="resource-card">
    <div className="feature-icon">📄</div>
    <h3>PDF Support</h3>
    <p>
      Upload lecture notes, study guides, and academic documents in PDF
      format for easy sharing with other students.
    </p>
  </div>

  <div className="resource-card">
    <div className="feature-icon">📘</div>
    <h3>Word Documents</h3>
    <p>
      Submit assignments, reports, and written materials quickly and
      share them with classmates.
    </p>
  </div>

  <div className="resource-card">
    <div className="feature-icon">🎥</div>
    <h3>Video Tutorials</h3>
    <p>
      Share recorded lectures, explanations, and tutorials to help
      others understand complex topics.
    </p>
  </div>

  <div className="resource-card">
    <div className="feature-icon">⚡</div>
    <h3>Fast Access</h3>
    <p>
      Instantly search, download, and manage shared academic resources
      from one organized platform.
    </p>
  </div>

</div>

{/* STATISTICS SECTION */}
<div className="resource-stats">

  <div className="stat-card">
    <div className="stat-icon"></div>
    <h2>1000+</h2>
    <p>Resources Shared</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon"></div>
    <h2>500+</h2>
    <p>Active Students</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon"></div>
    <h2>200+</h2>
    <p>Video Tutorials</p>
  </div>

  <div className="stat-card">
    <div className="stat-icon"></div>
    <h2>50+</h2>
    <p>Subjects Covered</p>
  </div>

</div>

    </div>
  );
}
