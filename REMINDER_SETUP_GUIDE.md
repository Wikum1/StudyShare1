# Study Reminder System Setup Guide (WhatsApp)

## Overview
The reminder system sends **WhatsApp notifications** at the scheduled reminder time (custom time, not fixed at 6 hours before).

## Features
✅ Custom reminder time - Set reminder for any time before the task starts
✅ WhatsApp notifications - Messages on WhatsApp at reminder time
✅ Automatic scheduling - Reminders are scheduled on task creation
✅ Simple setup - Just Twilio configuration needed

---

## Installation

### 1. Install Required Packages
```bash
cd backend
npm install node-schedule twilio dotenv
```

### 2. Setup Environment Variables

Create a `.env` file in the backend folder (or copy from `.env.example`):

```env
# MongoDB & JWT
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Configuration

### WhatsApp Setup (Twilio)

1. Sign up at https://www.twilio.com
2. Verify your phone number
3. Go to Console → Account → API Keys
4. Copy:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
5. Get a Twilio phone number and set `TWILIO_PHONE_NUMBER`

**Example:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Frontend Implementation

The reminder time is already set in the UI with the AM/PM time picker:

1. **Create Task** → Select time with AM/PM buttons
2. **Enable Reminder** → Check "Set Reminder 🔔"
3. **Choose Reminder Date** → Click "📅 Select date"
4. **Choose Reminder Time** → Use hour/minute/AM-PM inputs
5. **Create** → Task is created and reminder is automatically scheduled

---

## How It Works

### Timeline Example:
- **Task Time:** April 5, 2026 at 2:00 PM
- **Reminder Time:** April 5, 2026 at 1:00 PM

When 1:00 PM arrives:
1. ✅ WhatsApp message sent (if phone number provided)
2. ✅ Reminder marked as sent

### WhatsApp Message Format

Quick message with task details:
- 📚 Task name and plan name
- 📅 Date
- 🕐 Time to start
- Formatted with emojis for clarity

**Example Message:**
```
📚 Study Math Chapter 5 (Math 101)
📅 Today at 2:00 PM
⏰ Time to study! Get ready now.
```

---

## User Profile Update

Users should add their phone number in their profile for WhatsApp notifications:

```
PUT /api/auth/profile
{
  "phoneNumber": "+94771234567"
}
```

---

## Testing Reminders

### Via Postman:

1. **Create a task** with reminder for 1 minute fromis now
2. **Wait 1 minute**
3. Check your email and WhatsApp

**Example Request:**
```json
{
  "title": "Test Task",
  "date": "2026-04-02",
  "time": "14:30",
  "hasReminder": true,
  "reminderDateTime": "2026-04-02T14:29:00",
  "isImportant": false,
  "status": "pending"
}
```

---

## Troubleshooting

### WhatsApp not sending:
- Verify Twilio credentials in `.env` are correct
- Ensure user has phone number in profile
- Check phone number format: `+country-code-number` (e.g., +94771234567)
- Verify WhatsApp is enabled on the target phone number
- Check server logs for Twilio API errors

### Reminders not scheduling:
- Check MongoDB connection
- Verify reminder time is in future
- Check server logs for scheduler initialization errors
- Restart backend server if testing multiple tasks

---

## API Endpoints

### Task Creation with Reminder
```
POST /api/study-plans/{planId}/tasks
```

**Request:**
```json
{
  "title": "Study Math Chapter 5",
  "date": "2026-04-05",
  "time": "14:30",
  "isImportant": true,
  "hasReminder": true,
  "reminderDateTime": "2026-04-05T13:00:00",
  "status": "pending"
}
```

### Update Reminder
```
PUT /api/study-plans/{planId}/tasks/{taskId}
```

Update any field including `reminderDateTime` or `hasReminder`

### Delete Task (Cancels Reminder)
```
DELETE /api/study-plans/{planId}/tasks/{taskId}
```

---

## Database Fields

### Task Model
- `hasReminder` (Boolean) - Enable/disable reminder
- `reminderDateTime` (Date) - When to send reminder
- `reminderSent` (Boolean) - Track if already sent

---

## Security Notes

- 🔒 Never commit `.env` file to git
- 🔒 Use environment variables for all secrets
- 🔒 Phone numbers should be validated before saving
- 🔒 Email addresses are from verified users

---

## Future Enhancements

- SMS notifications (via Twilio)
- Multiple reminder times per task
- Reminder frequency (daily, weekly, etc.)
- WhatsApp template messages with better formatting
- Webhook integration for external services

---

**Service Files:**
- WhatsApp: [backend/src/services/whatsappService.js](backend/src/services/whatsappService.js)
- Scheduler: [backend/src/services/reminderScheduler.js](backend/src/services/reminderScheduler.js)
- Task Controller: [backend/src/controllers/study.task.js](backend/src/controllers/study.task.js)

