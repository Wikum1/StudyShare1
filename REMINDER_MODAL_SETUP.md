# Reminder Modal Integration Guide

## Installation

1. **Component files created:**
   - `src/components/ReminderModal.jsx`
   - `src/components/ReminderModal.css`

2. **Add to your main app layout** (e.g., `App.js` or `DashboardHome.jsx`):

```jsx
import ReminderModal from "./components/ReminderModal";

export default function App() {
  return (
    <div className="app">
      {/* Add ReminderModal at top level to show over all pages */}
      <ReminderModal />
      
      {/* Rest of your app */}
      <Navbar />
      <main>
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
}
```

## How It Works

### Display Behavior

1. **On Mount:** Component automatically fetches triggered reminders
2. **If Reminders Exist:** Modal automatically opens with list view
3. **Auto-Poll:** Checks for new reminders every 5 minutes

### User Interactions

**List View:**
- Shows all triggered reminders
- Click "View" button → Details view
- Click "✓" button → Quick dismiss
- Click "Dismiss & Continue" → Close modal

**Details View:**
- Shows full reminder details (plan, date, time)
- Click "Mark as Done" → Dismiss reminder
- Click "Keep Reminder" → Back to list view
- Click "← Back" → Back to list view

### Features

✅ **Auto-Opens** when reminders exist  
✅ **Two-View Layout** - List and Details  
✅ **Click to Dismiss** reminders  
✅ **Auto-Refreshes** every 5 minutes  
✅ **Responsive** - Works on mobile  
✅ **Smooth Animations** - Professional feel  
✅ **Keyboard Friendly** - Can escape to close  

## Customization

### Change Poll Interval

In `ReminderModal.jsx`, line 23:

```javascript
// Change 5 * 60 * 1000 to your preferred interval (in milliseconds)
// Current: 5 minutes
// Examples:
// 60 * 1000 = 1 minute
// 2 * 60 * 1000 = 2 minutes
// 10 * 60 * 1000 = 10 minutes
const interval = setInterval(fetchReminders, 5 * 60 * 1000);
```

### Change Colors

Edit `ReminderModal.css`:

```css
/* Primary gradient color (currently purple) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors */
background: linear-gradient(135deg, YOUR_COLOR_1 0%, YOUR_COLOR_2 100%);
```

### Make Modal Non-Auto-Open

Remove this line in `ReminderModal.jsx` (line 44):

```javascript
// Remove this:
if (triggered.length > 0) {
  setReminders(triggered);
  setIsOpen(true);  // ← Remove this line
}
```

Then manually trigger with a button:

```jsx
import { useState } from "react";

const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>
  View Reminders
</button>
```

## Complete Integration Example

```jsx
import React from "react";
import ReminderModal from "./components/ReminderModal";
import DashboardNavbar from "./components/DashboardNavbar";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      {/* Modal appears here - auto-opens on reminders */}
      <ReminderModal />
      
      {/* Navigation */}
      <DashboardNavbar />
      
      {/* Main content */}
      <main className="app-main">
        {/* Your pages go here */}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
```

## Service Usage

The component uses `reminderService` which should have these methods:

```javascript
// In src/services/reminderService.js
reminderService.getTriggeredReminders()  // Get reminders past trigger time
reminderService.dismissReminder(id)      // Mark reminder as dismissed
```

Make sure your service file looks like [REMINDER_FRONTEND_GUIDE.md](../REMINDER_FRONTEND_GUIDE.md#1-service-integration)

## Testing

1. Create a task with reminder time set to **now** or past
2. Refresh the dashboard
3. Modal should automatically appear with the reminder
4. Click "Mark as Done" to test dismissal
5. Check that modal closes when all reminders dismissed

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Styling with Your Theme

If you use a CSS theme/variables, update in `ReminderModal.css`:

```css
/* Replace hardcoded colors with CSS variables */
.reminder-modal {
  border-radius: var(--border-radius, 12px);
  box-shadow: var(--box-shadow, 0 8px 32px rgba(0, 0, 0, 0.2));
}

.reminder-header {
  background: var(--primary-gradient);
  color: var(--text-light);
}

.btn-done {
  background: var(--primary-color);
}
```

## Troubleshooting

**Modal doesn't appear:**
1. Check browser console for errors
2. Verify `reminderService` is imported correctly
3. Ensure backend is returning triggered reminders
4. Check `token` is in localStorage

**Modal appears but no reminders:**
1. Verify reminders exist in database
2. Check `isTriggered` is set to `true`
3. Check `isDismissed` is `false`

**Styling looks broken:**
1. Ensure `ReminderModal.css` is in same folder as component
2. Check for CSS conflicts with existing styles
3. Use browser DevTools to debug z-index issues

---

**You're all set!** 🎉 The modal will now show reminders automatically.
