# Reminder API Quick Reference

## Base URL
```
http://localhost:5000/api/reminders
```

## Authentication
All endpoints require JWT Bearer token:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Endpoints

### 📋 GET /reminders
Get all active (non-triggered, non-dismissed) reminders.

**Response:**
```json
{
  "success": true,
  "message": "Reminders fetched successfully",
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcd13cd1c0000001",
      "task": "507f191e810c19729de860ea",
      "user": "507f1f77bcd13cd1c0000002",
      "title": "Chapter 3 Quiz Review",
      "reminderDateTime": "2024-01-20T13:45:00.000Z",
      "isTriggered": false,
      "isDismissed": false,
      "taskDate": "2024-01-20",
      "taskTime": "14:00",
      "planTitle": "Week 2: Control Structures",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### ⏰ GET /reminders/triggered
Get reminders that should be shown NOW (reminder time has passed).

**Response:**
```json
{
  "success": true,
  "message": "Triggered reminders fetched",
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcd13cd1c0000001",
      "title": "Chapter 3 Quiz Review",
      "reminderDateTime": "2024-01-20T13:45:00.000Z",
      "isTriggered": true,
      "isDismissed": false,
      "taskDate": "2024-01-20",
      "taskTime": "14:00",
      "planTitle": "Week 2: Control Structures"
    }
  ]
}
```

---

### 📅 GET /reminders/upcoming
Get reminders triggering within next 24 hours.

**Response:**
```json
{
  "success": true,
  "message": "Upcoming reminders fetched",
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcd13cd1c0000001",
      "title": "Learn Recursion",
      "reminderDateTime": "2024-01-20T14:00:00.000Z",
      "taskDate": "2024-01-20",
      "taskTime": "14:30"
    },
    {
      "_id": "507f1f77bcd13cd1c0000002",
      "title": "Practice Problems",
      "reminderDateTime": "2024-01-21T10:00:00.000Z",
      "taskDate": "2024-01-21",
      "taskTime": "10:30"
    }
  ]
}
```

---

### 📊 GET /reminders/stats
Get reminder statistics for user.

**Response:**
```json
{
  "success": true,
  "message": "Reminder statistics fetched",
  "data": {
    "total": 15,
    "active": 5,
    "triggered": 3,
    "dismissed": 7
  }
}
```

| Stat | Meaning |
|------|---------|
| `total` | Total reminders ever created |
| `active` | Not triggered, not dismissed |
| `triggered` | Past reminder time, not dismissed |
| `dismissed` | User marked as done |

---

### ✅ PUT /reminders/:reminderId/dismiss
Mark a reminder as dismissed (it won't show again).

**Path Parameters:**
- `reminderId` (string, required) - The reminder ID

**Response:**
```json
{
  "success": true,
  "message": "Reminder dismissed successfully",
  "data": {
    "_id": "507f1f77bcd13cd1c0000001",
    "title": "Chapter 3 Quiz Review",
    "isDismissed": true,
    "isTriggered": true
  }
}
```

---

### 📝 PUT /reminders/:reminderId
Update reminder trigger time. Resets `isTriggered` to false.

**Path Parameters:**
- `reminderId` (string, required) - The reminder ID

**Request Body:**
```json
{
  "reminderDateTime": "2024-01-20T14:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder time updated successfully",
  "data": {
    "_id": "507f1f77bcd13cd1c0000001",
    "title": "Chapter 3 Quiz Review",
    "reminderDateTime": "2024-01-20T14:30:00.000Z",
    "isTriggered": false,
    "isDismissed": false
  }
}
```

---

### 🗑️ DELETE /reminders/:reminderId
Permanently delete a reminder.

**Path Parameters:**
- `reminderId` (string, required) - The reminder ID

**Response:**
```json
{
  "success": true,
  "message": "Reminder deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "reminderDateTime is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to dismiss this reminder"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Reminder not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching reminders",
  "error": "Database connection failed"
}
```

---

## cURL Examples

### Get Active Reminders
```bash
curl -X GET http://localhost:5000/api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Triggered Reminders
```bash
curl -X GET http://localhost:5000/api/reminders/triggered \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Dismiss a Reminder
```bash
curl -X PUT http://localhost:5000/api/reminders/507f1f77bcd13cd1c0000001/dismiss \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Update Reminder Time
```bash
curl -X PUT http://localhost:5000/api/reminders/507f1f77bcd13cd1c0000001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reminderDateTime": "2024-01-20T14:30:00Z"
  }'
```

### Delete a Reminder
```bash
curl -X DELETE http://localhost:5000/api/reminders/507f1f77bcd13cd1c0000001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## JavaScript Fetch Examples

### Get Active Reminders
```javascript
const token = localStorage.getItem("token");

fetch("/api/reminders", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(data => console.log(data.data))
.catch(err => console.error(err));
```

### Dismiss a Reminder
```javascript
const reminderId = "507f1f77bcd13cd1c0000001";
const token = localStorage.getItem("token");

fetch(`/api/reminders/${reminderId}/dismiss`, {
  method: "PUT",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(data => console.log("Reminder dismissed"))
.catch(err => console.error(err));
```

### Get Statistics
```javascript
const token = localStorage.getItem("token");

fetch("/api/reminders/stats", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(data => {
  console.log(`Active: ${data.data.active}`);
  console.log(`Triggered: ${data.data.triggered}`);
})
.catch(err => console.error(err));
```

---

## Data Types & Formats

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `_id` | ObjectId | String | "507f1f77bcd13cd1c0000001" |
| `reminderDateTime` | Date | ISO 8601 | "2024-01-20T13:45:00.000Z" |
| `taskDate` | String | YYYY-MM-DD | "2024-01-20" |
| `taskTime` | String | HH:MM | "14:00" |
| `isTriggered` | Boolean | true/false | true |
| `isDismissed` | Boolean | true/false | false |

---

## Common Scenarios

### Scenario 1: Show Triggered Reminders on Dashboard Load

```javascript
async function loadDashboard() {
  const reminders = await fetch("/api/reminders/triggered", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  reminders.data.forEach(r => {
    showNotification(`Reminder: ${r.title}`);
  });
}
```

### Scenario 2: Check for Reminders Every 5 Minutes

```javascript
setInterval(async () => {
  const reminders = await fetch("/api/reminders/triggered", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  if (reminders.count > 0) {
    notifyUser(reminders.data);
  }
}, 5 * 60 * 1000);
```

### Scenario 3: User Dismisses Notification

```javascript
async function userDismissesReminder(reminderId) {
  await fetch(`/api/reminders/${reminderId}/dismiss`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  removeFromUI(reminderId);
}
```

### Scenario 4: Show Next 24 Hours Widget

```javascript
async function loadUpcoming() {
  const upcoming = await fetch("/api/reminders/upcoming", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  return upcoming.data; // Display in sidebar
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing parameters) |
| 403 | Unauthorized (not your reminder) |
| 404 | Reminder not found |
| 500 | Server error |

---

## Notes

- All dates/times are in **ISO 8601 format (UTC)**
- User can only access their own reminders (enforced by user ID)
- Dismissing a reminder doesn't delete it (can view history)
- Deleting a reminder is permanent
- Triggered reminders reset `isTriggered` when time is updated
