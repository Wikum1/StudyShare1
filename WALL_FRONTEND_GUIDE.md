# Wall Feature - Frontend Implementation Guide

## Overview

The Wall is a complete discussion forum feature built with React that allows users to create, read, update, and delete posts, comment on discussions, react with emojis, and receive notifications in real-time.

## Architecture

### Pages
- **Wall.jsx** - Main feed page with post listing, searching, filtering, and pagination

### Components
- **CreatePost.jsx** - Modal for creating new posts
- **PostCard.jsx** - Individual post display with full CRUD operations
- **Comments.jsx** - Threaded comment system with nested replies
- **ReactionPicker.jsx** - Emoji reaction selector (👍❤️😄😮😢😠)
- **Notifications.jsx** - Real-time notification panel with unread badge

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Wall.jsx            # Main wall/feed page
│   │   └── Wall.css
│   ├── components/
│   │   ├── CreatePost.jsx      # New post modal
│   │   ├── CreatePost.css
│   │   ├── PostCard.jsx        # Individual post display
│   │   ├── PostCard.css
│   │   ├── Comments.jsx        # Comments with threading
│   │   ├── Comments.css
│   │   ├── ReactionPicker.jsx  # Emoji reactions
│   │   ├── ReactionPicker.css
│   │   ├── Notifications.jsx   # Notification panel
│   │   ├── Notifications.css
│   │   └── DashboardNavbar.jsx # Updated with Notifications
│   └── App.js                  # Updated with Wall route
```

## Component Details

### 1. Wall.jsx (Main Feed Page)

**Purpose**: Display posts with search, sorting, and pagination

**Features**:
- List all posts with pagination (10 per page)
- Sort by "Latest" or "Most Liked"
- Search posts by title/content
- Create new post button (authenticated users only)
- Responsive design

**State Management**:
- `posts` - Array of post objects
- `page` - Current pagination page
- `totalPages` - Total number of pages
- `sortBy` - Current sort method
- `searchQuery` - Current search text
- `showCreatePost` - Modal visibility toggle

**Key Functions**:
- `fetchPosts()` - Get posts from API with filtering
- `handlePostCreated()` - Add new post to feed
- `handlePostDeleted()` - Remove deleted post from feed
- `handlePostUpdated()` - Update edited post in feed
- `handleSearch()` - Filter posts by search query

**Props Passed to Children**:
- `PostCard`: `post`, `onPostDeleted`, `onPostUpdated`
- `CreatePost`: `onClose`, `onPostCreated`

**Route**: `/dashboard/wall`

---

### 2. CreatePost.jsx (New Post Modal)

**Purpose**: Modal form for creating new posts

**Features**:
- Popup modal with title, content, and tags input
- Character count feedback for title (max 200)
- Character count for content
- Tag input with comma separation
- Error message display
- Loading state while posting
- Close button (X) and outside click to dismiss

**State Management**:
- `title` - Post title (max 200 chars)
- `content` - Post content
- `tags` - Comma-separated tags
- `loading` - Submission state
- `error` - Error message

**Key Functions**:
- `handleSubmit()` - API call to create post
  - Validates inputs
  - Sends POST to `/api/posts`
  - Calls `onPostCreated` callback
  - Clears form on success

**API Call**:
```
POST /api/posts
Headers: Authorization: Bearer {token}
Body: { title, content, tags: [tag1, tag2, ...] }
```

**Error Handling**:
- Validates title and content are not empty
- Catches API errors and displays message
- Prevents submission while loading

---

### 3. PostCard.jsx (Individual Post Display)

**Purpose**: Display single post with all actions

**Features**:
- Author info with avatar
- Post creation date with edit indicator
- Like count, comment count, view count
- Action buttons: Like, Comment, React, Save
- Edit/Delete buttons (for post author only)
- Inline edit form for title and content
- Tags display as hashtags
- Integrated comment section
- Integrated reaction picker

**State Management**:
- `isLiked` - Current user like status
- `likeCount` - Total likes
- `showComments` - Comments section visibility
- `isSaved` - Bookmark status
- `showReactions` - Reaction picker visibility
- `isEditing` - Edit mode toggle
- `editedTitle`, `editedContent` - Edit form values
- `loading` - Edit submission state

**Key Functions**:
- `handleLike()` - Toggle like status
- `handleSave()` - Toggle bookmark
- `handleDelete()` - Delete post (auth check)
- `handleUpdate()` - Save edited post
- `formatDate()` - Format timestamps

**API Calls**:
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/save` - Toggle save
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id` - Update post

**Styling**:
- Gradient borders on hover
- Active state for liked posts
- Edit form with save/cancel buttons
- Stats section with dividers
- Action buttons with icon emojis

---

### 4. Comments.jsx (Threaded Comments)

**Purpose**: Display and manage comments with nesting support

**Features**:
- Fetch comments on component mount
- Add new comments or replies
- Nested replies (indented display)
- Edit indicator for modified comments
- Delete comments (author only)
- Reply button to start nested reply
- Comment like count display
- Relative time formatting (just now, 5m ago, etc.)

**State Management**:
- `comments` - Array of root comments with replies
- `newComment` - Text input value
- `loading` - Submission/fetch state
- `replyingTo` - Current reply target ID
- `error` - Error messages

**Key Functions**:
- `fetchComments()` - GET comments for post
- `handleSubmitComment()` - Create comment or reply
  - Handles both root and nested replies
  - Updates comment count on post
  - Creates notification for author
- `handleDeleteComment()` - Delete with confirmation
- `formatDate()` - Relative time formatting

**API Calls**:
- `GET /api/comments/post/:postId` - Fetch comments
- `POST /api/comments` - Create comment
  - Body: `{ content, postId, parentCommentId }`
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Toggle like

**Nested Reply Flow**:
1. User clicks "Reply" on a comment
2. `replyingTo` state set to parent comment ID
3. Input field shows "Write a reply..." placeholder
4. Reply indicator shows current target
5. On submit, `parentCommentId` sent to API
6. Reply appears in parent's `replies` array

---

### 5. ReactionPicker.jsx (Emoji Reactions)

**Purpose**: Add emoji reactions to posts and comments

**Features**:
- 6 emoji types: 👍❤️😄😮😢😠
- Display current reactions summary
- Show count per emoji type
- One reaction per user per target
- Hover animation effects
- Disabled state during loading

**State Management**:
- `reactions` - Array of reaction objects with counts
- `userReaction` - Current user's reaction type
- `loading` - API call state

**Key Functions**:
- `fetchReactions()` - Get reactions for post/comment
- `handleAddReaction()` - Toggle user reaction
  - Removes old reaction if exists
  - Creates new reaction
  - Updates UI

**API Calls**:
- `GET /api/reactions?postId=X&commentId=Y` - Fetch reactions
- `POST /api/reactions` - Add reaction
  - Body: `{ type, postId, commentId }`
- `DELETE /api/reactions/:reactionId` - Remove reaction

**Styling**:
- Button grid layout
- Active state with gradient background
- Badge showing count per reaction type
- Hover scale effect (1.1)

---

### 6. Notifications.jsx (Notification Panel)

**Purpose**: Real-time notification system with unread counter

**Features**:
- Bell icon with unread count badge
- Slide-down panel on bell click
- Lists notifications with icon, message, and timestamp
- Mark single notification as read
- Mark all as read button
- Delete individual notifications
- Auto-refresh every 30 seconds
- Relative time formatting
- Responsive mobile layout

**State Management**:
- `notifications` - Array of notification objects
- `unreadCount` - Count of unread notifications
- `loading` - Fetch state
- `showPanel` - Panel visibility toggle

**Key Functions**:
- `fetchUnreadCount()` - Get unread count (polled every 30s)
- `fetchNotifications()` - Paginated list of notifications
- `handleMarkAsRead()` - Mark single notification
- `handleMarkAllAsRead()` - Batch mark all read
- `handleDelete()` - Remove notification
- `formatDate()` - Relative time
- `getNotificationIcon()` - Map type to emoji

**API Calls**:
- `GET /api/notifications/unread/count` - Unread count
- `GET /api/notifications?page=1&limit=20` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all read
- `DELETE /api/notifications/:id` - Delete notification

**Notification Types**:
- `like` 👍 - User liked post/comment
- `love` ❤️ - User reacted with love
- `comment` 💬 - User commented on post
- `reply` ↩️ - User replied to comment
- `follow` 👥 - User followed you

---

## Integration Points

### With DashboardNavbar
- Notifications component added to right side
- Shows unread badge
- Accessible from all dashboard pages

### With App.js
- Wall route added: `/dashboard/wall`
- Wrapped with DashboardLayout component
- Uses standard dashboard navbar and footer

### Storage & Authentication
All components use localStorage for:
```javascript
const userData = JSON.parse(localStorage.getItem("user") || "{}");
const token = userData?.token;
const userId = userData?._id;
```

## API Integration

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
All authenticated requests include:
```javascript
Authorization: `Bearer ${token}`
```

### Endpoints Used

**Posts**:
- `GET /posts` - List with pagination, search, sort
- `POST /posts` - Create new post
- `GET /posts/:id` - Get single post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Toggle like
- `POST /posts/:id/save` - Toggle save

**Comments**:
- `GET /comments/post/:postId` - List comments
- `POST /comments` - Create comment or reply
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `POST /comments/:id/like` - Like comment

**Reactions**:
- `GET /reactions` - List reactions
- `POST /reactions` - Add reaction
- `DELETE /reactions/:reactionId` - Remove reaction

**Notifications**:
- `GET /notifications` - List notifications
- `GET /notifications/unread/count` - Unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all read
- `DELETE /notifications/:id` - Delete notification

## Styling Approach

### Color Scheme
- Primary: `#5b7cff` to `#3b82f6` (Blue gradient)
- Background: `#f8fafc` (Light gray)
- Text: `#1e293b` (Dark)
- Border: `#e2e8f0` (Light border)
- Error: `#991b1b` (Red)

### Responsive Breakpoints
- Desktop: Full width with sidebar
- Tablet: 768px - Adjusted layouts
- Mobile: Stacked components, full-width modals

### Component Styling Patterns
- Rounded corners: `border-radius: 8px` or `12px`
- Shadows: `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- Transitions: `transition: all 0.3s ease`
- Hover effects: Subtle elevation with `transform: translateY(-2px)`

## Usage Examples

### Creating a Post
1. Click "+ New Post" button on Wall page
2. Enter title (max 200 chars)
3. Enter content
4. Add tags (optional, comma-separated)
5. Click "Post"
6. New post appears at top of feed

### Commenting on a Post
1. Click "💬 Comment" button on post
2. Comment section expands
3. Type comment in textarea
4. Click "Comment" button
5. Comment appears in list

### Replying to a Comment
1. In comment section, click "↳ Reply" on comment
2. Reply indicator shows active target
3. Type reply text
4. Click "Comment"
5. Reply appears nested under parent

### Reacting to a Post
1. Click "😊 React" button on post
2. Reaction picker appears
3. Click emoji (👍❤️😄😮😢😠)
4. Your reaction is recorded
5. Reaction summary appears

### Editing a Post
1. On your own post, click "✎" (edit button)
2. Edit form appears with title and content
3. Make changes
4. Click "Save Changes"
5. Post updates with "(edited)" indicator

### Saving a Post
1. Click "🔖 Save" button on post
2. Post appears in your saved posts
3. Click again to unsave

### Viewing Notifications
1. Click 🔔 bell icon in DashboardNavbar
2. Panel slides down showing recent notifications
3. Click notification to mark as read
4. Click X to delete notification
5. Use "Mark all as read" to batch process

## Performance Considerations

- Pagination: 10 posts per page, 20 comments per page
- Auto-refresh: Notifications poll every 30 seconds
- Lazy loading: Comments load only when section expanded
- Memoization: Could add React.memo for PostCard in large lists
- Debouncing: Search could be debounced for faster API performance

## Security Features

- JWT token stored in localStorage
- Authorization checks on all mutations (edit/delete)
- Ownership verification (only authors can edit/delete)
- Input validation on forms
- XSS protection through React's default escaping

## Future Enhancements

1. **Real-time Updates**: Integrate Socket.io for live notifications
2. **User Profiles**: Click author name to view profile and posts
3. **Mentions**: @user mentions in comments
4. **Hashtags**: Click tags to filter posts
5. **User Following**: Follow users to see their posts first
6. **Search**: Global search across posts and comments
7. **Drafts**: Save draft posts before publishing
8. **Media**: Upload images/videos with posts
9. **Rich Text**: Editor with formatting options
10. **Moderation**: Report inappropriate content

## Troubleshooting

### Posts Not Loading
- Check backend is running on port 5000
- Verify API_BASE URL is correct
- Check browser console for errors
- Ensure authentication token is valid

### Comments Not Saving
- Verify postId is being passed correctly
- Check user is authenticated
- Check backend `POST /api/comments` endpoint
- Look for validation errors in response

### Notifications Not Updating
- Verify token is in localStorage
- Check notification polling interval (30 seconds)
- Ensure backend is creating notifications
- Check browser console for API errors

### Images/Avatars Not Loading
- Verify image URLs in database
- Check CORS if loading from external source
- Ensure backend serves images correctly

## File Sizes (Approximate)

- Wall.jsx: ~4.5 KB
- Wall.css: ~3 KB
- CreatePost.jsx: ~3.2 KB
- CreatePost.css: ~2.8 KB
- PostCard.jsx: ~6.5 KB
- PostCard.css: ~4.2 KB
- Comments.jsx: ~7 KB
- Comments.css: ~3.5 KB
- ReactionPicker.jsx: ~2.8 KB
- ReactionPicker.css: ~1.5 KB
- Notifications.jsx: ~4.2 KB
- Notifications.css: ~2 KB

**Total Frontend Code**: ~45 KB (uncompressed)

## Testing Checklist

- [ ] Wall page loads posts correctly
- [ ] Search filters posts
- [ ] Sort by Latest/Most Liked works
- [ ] Pagination navigates correctly
- [ ] Create post modal opens/closes
- [ ] Posted posts appear at top
- [ ] Edit post updates content
- [ ] Delete post removes from feed
- [ ] Like/Unlike toggles status
- [ ] Save/Unsave works
- [ ] Comments load for posts
- [ ] Add comment works
- [ ] Reply to comment nests properly
- [ ] Delete comment removes from list
- [ ] Reactions appear/disappear
- [ ] Notifications panel shows
- [ ] Mark as read updates status
- [ ] Delete notification removes
- [ ] Responsive on mobile view
- [ ] No console errors
