# In-App Reminder System - Setup & Usage Guide

## Overview

StudyShare1 now includes a **simple, distraction-free in-app reminder system** for study tasks. Reminders are stored in the database and displayed to users when the reminder time arrives.

**Key Features:**
- ✅ No email setup required
- ✅ No external dependencies or APIs
- ✅ Database-only solution
- ✅ Automatic reminder scheduling
- ✅ Users can dismiss or delete reminders
- ✅ View upcoming reminders within 24 hours

---

## How It Works

### 1. **Creating a Reminder**

When creating a task with `hasReminder: true`:

```javascript
{
  "title": "Chapter 3 Quiz Review",
  "date": "2024-01-20",
  "time": "14:00",
  "hasReminder": true,
  "reminderDateTime": "2024-01-20T13:45:00Z"  // 15 mins before task
}
```

The system:
1. Saves the task to Task collection
2. Scheduler watches for the reminder time
3. At reminder time, creates a Reminder record in the database
4. Marks reminder as `isTriggered: true`

### 2. **Displaying Reminders**

On user login or dashboard load:

```javascript
// Frontend calls
GET /api/reminders/triggered  // Get reminders that should be shown NOW
GET /api/reminders/upcoming   // Get reminders in next 24 hours
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcd13cd1c0000001",
      "task": "507f191e810c19729de860ea",
      "user": "507f1f77bcd13cd1c0000002",
      "title": "Chapter 3 Quiz Review",
      "reminderDateTime": "2024-01-20T13:45:00Z",
      "isTriggered": true,
      "isDismissed": false,
      "taskDate": "2024-01-20",
      "taskTime": "14:00",
      "planTitle": "Week 2: Control Structures"
    }
  ]
}
```

### 3. **User Actions**

**Dismiss a Reminder:**
```
PUT /api/reminders/{reminderId}/dismiss
```
- Marks `isDismissed: true`
- Reminder won't show again
- Can still create new reminder for same task

**Delete a Reminder:**
```
DELETE /api/reminders/{reminderId}
```
- Removes reminder record completely
- User can create new reminder if needed

**Update Reminder Time:**
```
PUT /api/reminders/{reminderId}
{
  "reminderDateTime": "2024-01-20T14:00:00Z"
}
```
- Changes reminder trigger time
- Resets `isTriggered: false`
- Reschedules notification

---

## Database Schema

### Reminder Model

```javascript
{
  task: ObjectId,              // Reference to Task
  user: ObjectId,              // Reference to User
  title: String,               // Task title (for quick display)
  reminderDateTime: Date,      // When to trigger reminder
  isTriggered: Boolean,        // Has reminder time passed?
  isDismissed: Boolean,        // User dismissed this reminder?
  taskDate: String,            // Task date (YYYY-MM-DD)
  taskTime: String,            // Task time (HH:MM)
  planTitle: String,           // Study plan title
  createdAt: Date,             // When reminder was created
  updatedAt: Date              // When reminder was last updated
}
```

**Indexes:**
- `(user, isTriggered)` - Quick fetch of triggered reminders
- `(reminderDateTime)` - Efficient time-based queries

---

## API Reference

### Authentication
All reminder endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

### Endpoints

#### Get All Active Reminders
```
GET /api/reminders
```
Returns all non-triggered, non-dismissed reminders for user.

#### Get Triggered Reminders
```
GET /api/reminders/triggered
```
Returns reminders past their trigger time that haven't been dismissed.

#### Get Upcoming Reminders (24h)
```
GET /api/reminders/upcoming
```
Returns reminders triggering within next 24 hours.

#### Get Reminder Statistics
```
GET /api/reminders/stats
```
Returns counts of total, active, triggered, dismissed reminders.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "active": 5,
    "triggered": 3,
    "dismissed": 7
  }
}
```

#### Dismiss a Reminder
```
PUT /api/reminders/{reminderId}/dismiss
```
Marks reminder as dismissed (won't be shown).

#### Update Reminder Time
```
PUT /api/reminders/{reminderId}
{
  "reminderDateTime": "2024-01-20T14:30:00Z"
}
```

#### Delete a Reminder
```
DELETE /api/reminders/{reminderId}
```
Permanently removes reminder record.

---

## Automatic Reminder Scheduler

The system runs a **reminder scheduler** automatically:

1. **On Server Start:**
   - Loads all unsent reminders from database
   - Schedules each reminder using node-schedule
   - Logs pending reminders to console

2. **When Reminder Time Arrives:**
   - Scheduler triggers callback
   - System creates Reminder record
   - Marks reminder as `isTriggered: true`
   - Logs ✅ completion

3. **When Task is Updated:**
   - If `hasReminder` changes, scheduler updates job
   - If `reminderDateTime` changes, reschedules
   - If `hasReminder: false`, cancels scheduled job

---

## Usage Examples

### Example 1: Create Task with Reminder

```javascript
// POST /api/study-plans/{planId}/tasks
const taskData = {
  title: "Learn Recursion",
  description: "Study chapter 5",
  date: "2024-01-20",
  time: "14:00",
  isImportant: true,
  hasReminder: true,
  reminderDateTime: "2024-01-20T13:45:00Z"  // 15 mins before
};
```

**What happens:**
- Task created
- Scheduler registers reminder check
- At 13:45 UTC, reminderDateTime triggers
- Reminder record auto-created
- Frontend can display notification

### Example 2: User Sees Reminder on Login

```javascript
// Frontend on dashboard load
const response = await fetch('/api/reminders/triggered', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const reminders = response.data;  // Get triggered reminders
// Display as toast/modal notification
```

### Example 3: User Dismisses Reminder

```javascript
// User clicks "Done" on reminder
await fetch(`/api/reminders/${reminderId}/dismiss`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
// Reminder won't show again
```

---

## No Configuration Needed

Unlike previous email-based systems, **NO environment variables needed**:

- ❌ No SMTP_HOST
- ❌ No SMTP_PORT
- ❌ No EMAIL_USER
- ❌ No EMAIL_PASSWORD
- ❌ No WEBSITE_EMAIL
- ❌ No external API keys

The system uses only:
- ✅ MongoDB (already configured)
- ✅ node-schedule (already installed)
- ✅ Node.js/Express (existing)

---

## Scheduler Behavior

### On Server Start
```
🔔 Initializing Reminder Scheduler...
Found 5 pending reminders
📅 Reminder scheduled for task "Learn Recursion" in 3600 seconds
✅ Reminder Scheduler initialized
```

### When Reminder Triggers
```
🔔 Triggering reminder for task: Learn Recursion
✅ Reminder created for task: Learn Recursion
```

### When Task Updated
```
⏹️  Cancelled reminder for task 507f1f77bcd13cd1c0000001
📅 Reminder scheduled for task "Learn Recursion" in 5400 seconds
```

---

## Reminders Collection Structure

```
Reminders
├── Schema
│   ├── task: ObjectId → Tasks
│   ├── user: ObjectId → Users
│   ├── title: String
│   ├── reminderDateTime: Date
│   ├── isTriggered: Boolean
│   ├── isDismissed: Boolean
│   ├── taskDate: String
│   ├── taskTime: String
│   └── planTitle: String
├── Indexes
│   ├── (user, isTriggered) - Quick fetch
│   └── (reminderDateTime) - Time-based queries
```

---

## Troubleshooting

### Reminders Not Showing Up

**Check:**
1. Is `hasReminder: true` set on task?
2. Is `reminderDateTime` in future?
3. Has scheduler initialized? (Check console logs)

**Test:**
```javascript
// GET /api/reminders/stats
// Should show some reminders exist
```

### Reminders Triggering Early/Late

**Cause:** System time difference or timezone mismatch

**Solution:**
- Use ISO 8601 format for reminderDateTime
- Ensure server and DB are in same timezone
- Check node-schedule logs at startup

### Too Many Reminders

**Clean up:**
```javascript
// Delete dismissed reminders
DELETE /api/reminders/{reminderId}

// Or bulk dismiss
PUT /api/reminders/{reminderId}/dismiss
```

---

## Summary

This in-app reminder system is:
- **Simple:** Database only, no external services
- **Reliable:** Scheduler ensures reminders trigger on time
- **User-Friendly:** Easy dismiss/update/delete actions
- **Performant:** Indexed queries for fast retrieval
- **Maintainable:** No complex email/SMS Logic

Enjoy distraction-free reminders! 📚⏰
