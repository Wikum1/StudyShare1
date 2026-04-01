const nodemailer = require("nodemailer");

// Configure your email service
// For Gmail: Use App Password (not regular password)
// For other services: Update credentials accordingly
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
  }
});

/**
 * Send reminder email to user
 * @param {string} userEmail - User's email address
 * @param {Object} taskDetails - Task information
 * @returns {Promise<Object>} Email send result
 */
const sendReminderEmail = async (userEmail, taskDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@studyshare.com",
      to: userEmail,
      subject: `📚 Study Reminder: ${taskDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">📚 Study Reminder</h2>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #667eea;">
            <p style="color: #333; font-size: 16px;">
              <strong>It's time to study!</strong>
            </p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Task:</strong> ${taskDetails.title}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${taskDetails.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${taskDetails.time}</p>
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${taskDetails.planTitle || "Study Plan"}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              Open StudyShare to view all your tasks and stay on track with your goals.
            </p>
          </div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #999;">
            <p>StudyShare - Your Personal Study Planner</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Reminder email sent:", result.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error.message);
    return false;
  }
};

module.exports = {
  sendReminderEmail,
  verifyEmailConfig,
  transporter
};
