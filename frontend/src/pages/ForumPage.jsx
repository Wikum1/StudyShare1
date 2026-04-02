import "./ForumPage.css";
import forumImage from "../assets/forum-discussion.jpg";

export default function ForumPage() {
  return (
    <div className="forum-page">

      {/* HERO SECTION */}
      <div className="forum-hero">
        <div className="forum-hero-content">
          <h1>💬 Discussion Forum</h1>
          <p>
            Ask questions, kisara share knowledge and collaborate with fellow students
            in academic discussions.
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

<div className="forum-illustration">

  <div className="forum-text">

    <h2>💬 Learn Together Through Discussions</h2>

    <p>
      StudyShare Forum provides a collaborative space where students can
      ask academic questions, share knowledge, and help each other
      understand difficult concepts.
    </p>

    <p>
      Instead of studying alone, students can participate in discussions,
      share ideas, exchange resources, and build a strong learning
      community that supports academic success.
    </p>

    <div className="forum-highlights">

      <div className="highlight-item">❓ Ask Academic Questions</div>
      <div className="highlight-item">💡 Share Knowledge</div>
      <div className="highlight-item">🤝 Collaborate with Students</div>
      <div className="highlight-item">📚 Discuss Study Materials</div>

    </div>

  </div>

  <div className="forum-image">
    <img src={forumImage} alt="Students discussing topics" />
  </div>

</div>


{/* FEATURES SECTION */}

<div className="forum-features">

  <div className="forum-card">
    <div className="forum-icon">❓</div>
    <h3>Ask Questions</h3>
    <p>Post questions related to your subjects and receive answers.</p>
  </div>

  <div className="forum-card">
    <div className="forum-icon">🤝</div>
    <h3>Peer Collaboration</h3>
    <p>Discuss academic topics with fellow students.</p>
  </div>

  <div className="forum-card">
    <div className="forum-icon">💡</div>
    <h3>Knowledge Sharing</h3>
    <p>Share ideas, notes and study tips with the community.</p>
  </div>

  <div className="forum-card">
    <div className="forum-icon">🔔</div>
    <h3>Notifications</h3>
    <p>Stay updated with replies and discussion activity.</p>
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