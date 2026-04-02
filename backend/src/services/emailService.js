const nodemailer = require("nodemailer");

// Configure email transporter for sending from website email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.WEBSITE_EMAIL,
    pass: process.env.WEBSITE_EMAIL_PASSWORD,
  },
});

/**
 * Send reminder email to user-specified email address
 * @param {string} recipientEmail - Email to send reminder to
 * @param {Object} taskDetails - Task information
 * @returns {Promise<boolean>} Success status
 */
const sendReminderEmail = async (recipientEmail, taskDetails) => {
  try {
    if (!recipientEmail) {
      console.log("No reminder email specified for task");
      return true; // Not an error, just no email to send
    }

    const mailOptions = {
      from: {
        name: "StudyShare",
        email: process.env.WEBSITE_EMAIL,
      },
      to: recipientEmail,
      subject: `📚 Study Reminder: ${taskDetails.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; font-size: 28px; font-weight: 600;">📚 Study Reminder</h2>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">It's time to focus on your studies</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 30px 20px;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
              <strong>Study reminder from StudyShare:</strong>
            </p>

            <!-- Task Card -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; margin: 20px 0; color: white;">
              <div style="margin-bottom: 12px;">
                <p style="margin: 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Task</p>
                <h3 style="margin: 5px 0 0 0; font-size: 22px; font-weight: 600;">${taskDetails.title}</h3>
              </div>
              
              <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px;">
                <div style="display: inline-block; min-width: 100px;">
                  <p style="margin: 0; font-size: 12px; opacity: 0.9;">📅 Date</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">${taskDetails.date}</p>
                </div>
                <div style="display: inline-block; min-width: 100px; margin-left: 20px;">
                  <p style="margin: 0; font-size: 12px; opacity: 0.9;">⏰ Time</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">${taskDetails.time}</p>
                </div>
              </div>

              ${
                taskDetails.planTitle
                  ? `
              <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px;">
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">📋 Study Plan</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">${taskDetails.planTitle}</p>
              </div>
              `
                  : ""
              }
            </div>

            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0; line-height: 1.6;">
              Stay focused and consistent with your study goals. You're doing great! 🚀
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; color: #999;">
              StudyShare - Your Personal Study Planner
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #bbb;">
              This is an automated reminder from your StudyShare account.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${recipientEmail}`, {
      messageId: result.messageId,
    });
    return true;
  } catch (error) {
    console.error(`❌ Error sending reminder email to ${recipientEmail}:`, error.message);
    return false;
  }
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
  try {
    if (!process.env.WEBSITE_EMAIL || !process.env.WEBSITE_EMAIL_PASSWORD) {
      console.error(
        "❌ Website email not configured. Set WEBSITE_EMAIL and WEBSITE_EMAIL_PASSWORD in .env"
      );
      return false;
    }

    await transporter.verify();
    console.log("✅ Email service is ready to send reminders");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error.message);
    return false;
  }
};

module.exports = {
  sendReminderEmail,
  verifyEmailConfig,
};

