// WhatsApp Notification Service using Twilio
// Setup: Install twilio and get credentials from https://www.twilio.com

const twilio = require("twilio");

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID || "your-account-sid";
const authToken = process.env.TWILIO_AUTH_TOKEN || "your-auth-token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

let client = null;

try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
  }
} catch (error) {
  console.warn("⚠️  Twilio not configured. WhatsApp notifications disabled.");
}

/**
 * Send reminder via WhatsApp
 * @param {string} userPhoneNumber - User's phone number (include country code, e.g., +94771234567)
 * @param {Object} taskDetails - Task information
 * @returns {Promise<Object>} Message send result
 */
const sendWhatsAppReminder = async (userPhoneNumber, taskDetails) => {
  try {
    if (!client) {
      return {
        success: false,
        error: "WhatsApp service not configured. Add TWILIO credentials to .env"
      };
    }

    if (!userPhoneNumber) {
      return {
        success: false,
        error: "User phone number not provided"
      };
    }

    const messageBody = `📚 *Study Reminder!*

Task: ${taskDetails.title}
Date: ${taskDetails.date}
Time: ${taskDetails.time}
Plan: ${taskDetails.planTitle || "Study Plan"}

Open StudyShare to view all your tasks and stay focused!`;

    const message = await client.messages.create({
      body: messageBody,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${userPhoneNumber}`
    });

    console.log("WhatsApp reminder sent:", message.sid);
    return { success: true, message: "WhatsApp message sent successfully", messageSid: message.sid };
  } catch (error) {
    console.error("Error sending WhatsApp reminder:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify WhatsApp/Twilio configuration
 */
const verifyWhatsAppConfig = () => {
  if (!client) {
    console.warn("❌ WhatsApp service not configured");
    return false;
  }
  console.log("✅ WhatsApp service is configured");
  return true;
};

module.exports = {
  sendWhatsAppReminder,
  verifyWhatsAppConfig
};
