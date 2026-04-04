import "./StudyPlannerPage.css";
import plannerImage from "../assets/study-planner.jpg";

export default function StudyPlannerPage() {
  return (
    <div className="planner-page">

      {/* HERO SECTION */}
      <div className="planner-hero" style={{ backgroundImage: `url(${plannerImage})` }}>
        <div className="planner-hero-overlay"></div>
        <div className="planner-hero-content">
          <h1>📅 Study Planner</h1>
          <p>
            Organize your academic schedule, track tasks and manage your
            study goals efficiently in one smart planner.
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

<div className="planner-illustration">

  <div className="planner-text">

    <h2>📚 Plan Your Study Time Efficiently</h2>

    <p>
      StudyShare Planner helps students stay organized by managing
      tasks, deadlines, and study schedules in one place. Instead of
      forgetting assignments or exam dates, the planner keeps everything
      clearly structured and easy to track.
    </p>

    <p>
      Students can create study plans, set priorities, track progress,
      and maintain a balanced academic routine. The planner ensures
      better productivity and helps students achieve their academic goals.
    </p>

    <div className="planner-highlights">

      <div className="highlight-item">📅 Smart Study Scheduling</div>
      <div className="highlight-item">⏰ Assignment Reminders</div>
      <div className="highlight-item">📊 Progress Tracking</div>
      <div className="highlight-item">🎯 Goal Planning</div>

    </div>

  </div>

  <div className="planner-image">
    <img src={plannerImage} alt="Study planner illustration" />
  </div>

</div>


{/* FEATURES SECTION */}

<div className="planner-features">

  <div className="planner-card">
    <div className="planner-icon">📝</div>
    <h3>Task Management</h3>
    <p>Create and manage daily study tasks easily.</p>
  </div>

  <div className="planner-card">
    <div className="planner-icon">📅</div>
    <h3>Smart Scheduling</h3>
    <p>Plan your weekly study sessions efficiently.</p>
  </div>

  <div className="planner-card">
    <div className="planner-icon">⏰</div>
    <h3>Deadline Tracking</h3>
    <p>Never miss assignments or exam deadlines.</p>
  </div>

  <div className="planner-card">
    <div className="planner-icon">📊</div>
    <h3>Progress Tracking</h3>
    <p>Monitor your study progress and stay motivated.</p>
  </div>

</div>


{/* STATISTICS */}

<div className="planner-stats">

  <div className="stat-card">
    <h2>500+</h2>
    <p>Study Plans Created</p>
  </div>

  <div className="stat-card">
    <h2>300+</h2>
    <p>Students Using Planner</p>
  </div>

  <div className="stat-card">
    <h2>1000+</h2>
    <p>Tasks Completed</p>
  </div>

  <div className="stat-card">
    <h2>50+</h2>
    <p>Subjects Planned</p>
  </div>

</div>

    </div>
  );
}