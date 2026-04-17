# Progress Tracking Feature Guide

## Overview
The progress tracking feature provides comprehensive analytics and milestone management for your study plans.

## Features Added

### 1. **Overall Progress Calculation**
- Automatically calculates completion percentage based on completed tasks
- Updates in real-time as tasks are marked complete/pending

### 2. **Plan Due Dates**
- Set a target completion date for the entire plan
- System tracks days remaining until due date
- Generates alerts if plan is behind schedule

### 3. **Milestones**
- Create sub-goals within your study plan
- Track milestone completion separately
- Mark milestones as complete with timestamps
- Get notifications for overdue milestones

### 4. **Detailed Statistics**
- Task breakdown by priority level
- Completion rates by priority
- On-track status vs. due date
- Milestone progress percentage

### 5. **Smart Recommendations**
- AI-generated optimization suggestions based on progress
- Alerts for high-priority incomplete tasks
- Deadline warnings
- Suggestions to break down large tasks

---

## API Endpoints

### Get Plan Progress & Statistics
```
GET /api/study-plans/:id/progress
```

**Response:**
```json
{
  "plan": {
    "_id": "plan_id",
    "title": "Math Preparation",
    "subject": "Mathematics",
    "dueDate": "2026-05-17"
  },
  "stats": {
    "overallProgress": 65,
    "milestoneProgress": 50,
    "taskStats": {
      "total": 20,
      "completed": 13,
      "pending": 7,
      "byPriority": {
        "high": 8,
        "medium": 7,
        "low": 5
      },
      "completedByPriority": {
        "high": 5,
        "medium": 5,
        "low": 3
      }
    },
    "daysUntilDue": 30,
    "isOnTrack": true,
    "milestones": [
      {
        "title": "Complete Chapter 1",
        "description": "Learn basics",
        "targetDate": "2026-04-30",
        "completed": true,
        "completedDate": "2026-04-28",
        "isOverdue": false
      }
    ]
  },
  "recommendations": [
    "You're on track! Keep up the momentum",
    "Focus on remaining high-priority tasks"
  ]
}
```

---

### Update Plan with Due Date
```
PUT /api/study-plans/:id
```

**Request Body:**
```json
{
  "dueDate": "2026-05-17",
  "title": "Math Preparation",
  "subject": "Mathematics"
}
```

---

## Milestone Management

### Add Milestone
```
POST /api/study-plans/:id/milestones
```

**Request Body:**
```json
{
  "title": "Complete Chapter 1",
  "description": "Learn and practice all basics",
  "targetDate": "2026-04-30"
}
```

**Response:**
```json
{
  "message": "Milestone added",
  "milestone": {
    "_id": "milestone_id",
    "title": "Complete Chapter 1",
    "description": "Learn and practice all basics",
    "targetDate": "2026-04-30",
    "completed": false,
    "completedDate": null
  }
}
```

---

### Update Milestone
```
PUT /api/study-plans/:id/milestones/:milestoneId
```

**Request Body:**
```json
{
  "title": "Complete Chapter 1-2",
  "description": "Updated description",
  "targetDate": "2026-05-05"
}
```

---

### Mark Milestone as Complete
```
PATCH /api/study-plans/:id/milestones/:milestoneId/complete
```

**Response:**
```json
{
  "message": "Milestone marked as complete",
  "milestone": {
    "_id": "milestone_id",
    "title": "Complete Chapter 1",
    "completed": true,
    "completedDate": "2026-04-28T10:30:00Z"
  }
}
```

---

### Delete Milestone
```
DELETE /api/study-plans/:id/milestones/:milestoneId
```

**Response:**
```json
{
  "message": "Milestone deleted"
}
```

---

## Data Model Updates

### StudyPlan Schema Changes
```javascript
{
  // ... existing fields
  dueDate: Date,  // Optional due date for the entire plan
  milestones: [
    {
      title: String,
      description: String,
      targetDate: Date,
      completed: Boolean,
      completedDate: Date
    }
  ]
}
```

---

## Progress Calculation Formula

**Overall Progress % = (Completed Tasks / Total Tasks) × 100**

**Milestone Progress % = (Completed Milestones / Total Milestones) × 100**

**On-Track Status:**
- Calculated by comparing actual progress rate vs. expected progress rate
- Expected rate = 100% / (days until due date)
- Actual rate = current progress % / days elapsed

---

## Smart Recommendations Logic

The system provides recommendations based on:
1. **Low Progress** (< 30%): Suggest breaking down tasks
2. **Behind Schedule**: Highlight high-priority tasks to focus on
3. **No High-Priority Progress**: Encourage starting with critical tasks
4. **Deadline Approaching**: Alert if < 7 days left and progress < 80%
5. **Overdue Milestones**: Flag milestones past target date

---

## Frontend Integration Example

```javascript
// Get plan progress
async function getPlanProgress(planId) {
  const response = await fetch(`/api/study-plans/${planId}/progress`);
  const data = await response.json();
  
  console.log(`Progress: ${data.stats.overallProgress}%`);
  console.log(`Days remaining: ${data.stats.daysUntilDue}`);
  console.log(`Recommendations:`, data.recommendations);
}

// Add milestone
async function addMilestone(planId, title, targetDate) {
  const response = await fetch(`/api/study-plans/${planId}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description: 'Milestone description',
      targetDate
    })
  });
  return response.json();
}

// Complete milestone
async function completeMilestone(planId, milestoneId) {
  const response = await fetch(
    `/api/study-plans/${planId}/milestones/${milestoneId}/complete`,
    { method: 'PATCH' }
  );
  return response.json();
}
```

---

## Features You Can Still Add

1. **Visual Dashboard** - Charts showing progress over time
2. **Multiple Completion Targets** - Different paths to completion
3. **Team Progress** - Collaborative study plan tracking
4. **Progress Notifications** - Email/push alerts for milestones
5. **Re-planning API** - Auto-adjust dates based on progress
6. **Historical Data** - Archive and compare past plans
7. **Export Report** - PDF reports of plan progress
8. **Custom Metrics** - User-defined progress indicators

