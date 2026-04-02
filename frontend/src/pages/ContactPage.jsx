import "./ContactPage.css";

export default function ContactPage() {
  return (
    <div className="contact-page">

      {/* HERO SECTION */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact StudyShare</h1>
          <p>
            Have questions about our platform? Reach out to us and our
            team will respond as soon as possible.
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

      {/* CONTACT CARDS SECTION */}
      <div className="contact-features">

        {/* CONTACT INFO CARD */}
        <div className="contact-card">
          <h3>📧 Email Support</h3>
          <p>support@studyshare.com</p>
        </div>

        <div className="contact-card">
          <h3>📞 Phone</h3>
          <p>+94 71 234 5678</p>
        </div>

        <div className="contact-card">
          <h3>📍 Location</h3>
          <p>Colombo, Sri Lanka</p>
        </div>

      </div>

      {/* CONTACT FORM SECTION */}
      <div className="contact-form-section">

        <h2>Send Us a Message</h2>

        <form action="https://formspree.io/f/meelyzqp" method="POST">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
          />

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
  );
}