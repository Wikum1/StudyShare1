# Wall Feature API Documentation

## Overview
Complete API documentation for the StudyShare Wall (Discussion Forum) feature including posts, comments, reactions, notifications, and user profiles.

---

## Base URL
```
/api
```

---

## 1. POSTS ENDPOINTS

### Create Post
- **Method:** `POST`
- **Route:** `/posts`
- **Auth:** Required (JWT token)
- **Body:**
```json
{
  "title": "Post title",
  "content": "Post content",
  "tags": ["tag1", "tag2"]
}
```
- **Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "title": "Post title",
    "content": "Post content",
    "author": {
      "_id": "user_id",
      "name": "John Doe",
      "avatar": "avatar_url",
      "email": "email@example.com"
    },
    "tags": ["tag1", "tag2"],
    "likes": [],
    "likeCount": 0,
    "comments": [],
    "commentsCount": 0,
    "reactions": [],
    "views": 0,
    "isEdited": false,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get All Posts
- **Method:** `GET`
- **Route:** `/posts`
- **Auth:** Optional
- **Query Parameters:**
  - `page` (default: 1) - Page number
  - `limit` (default: 10) - Posts per page
  - `sortBy` (default: "createdAt") - Sort by "createdAt" or "likeCount"
  - `search` - Search by title or content
  - `tag` - Filter by tag
- **Example:** `/posts?page=1&limit=10&sortBy=likeCount&search=study&tag=exam`
- **Response:**
```json
{
  "message": "Posts retrieved successfully",
  "posts": [
    {
      "_id": "post_id",
      "title": "Post title",
      "content": "Post content",
      "author": {...},
      "likeCount": 5,
      "commentsCount": 2,
      "tags": ["tag1"]
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "totalPosts": 45
}
```

### Get Post By ID
- **Method:** `GET`
- **Route:** `/posts/:id`
- **Auth:** Optional
- **Response:** Complete post with all comments and reactions
```json
{
  "message": "Post retrieved successfully",
  "post": {
    "_id": "post_id",
    "title": "Post title",
    "content": "Post content",
    "author": {...},
    "comments": [...],
    "reactions": [...],
    "views": 15,
    "likeCount": 5
  }
}
```

### Update Post
- **Method:** `PUT`
- **Route:** `/posts/:id`
- **Auth:** Required (Author only)
- **Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["new_tag"]
}
```
- **Response:**
```json
{
  "message": "Post updated successfully",
  "post": {
    "_id": "post_id",
    "title": "Updated title",
    "isEdited": true,
    "editedAt": "timestamp"
  }
}
```

### Delete Post
- **Method:** `DELETE`
- **Route:** `/posts/:id`
- **Auth:** Required (Author only)
- **Response:**
```json
{
  "message": "Post deleted successfully"
}
```

### Toggle Like Post
- **Method:** `POST`
- **Route:** `/posts/:id/like`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "Post liked/unliked successfully",
  "isLiked": true,
  "likeCount": 6
}
```
- **Note:** Automatically creates a "like" notification if user is not self

### Toggle Save Post
- **Method:** `POST`
- **Route:** `/posts/:id/save`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "Post saved/unsaved successfully",
  "isSaved": true
}
```

### Get User's Posts
- **Method:** `GET`
- **Route:** `/posts/user/my-posts`
- **Auth:** Required
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** List of current user's posts with pagination

### Get Saved Posts
- **Method:** `GET`
- **Route:** `/posts/user/saved`
- **Auth:** Required
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** List of user's saved posts with pagination

---

## 2. COMMENTS ENDPOINTS

### Add Comment
- **Method:** `POST`
- **Route:** `/comments`
- **Auth:** Required
- **Body:**
```json
{
  "content": "Comment text",
  "postId": "post_id",
  "parentCommentId": "parent_comment_id"  // Optional for nested replies
}
```
- **Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "comment_id",
    "content": "Comment text",
    "author": { ... },
    "post": "post_id",
    "likes": [],
    "likeCount": 0,
    "replies": [],
    "isEdited": false
  }
}
```

### Get Post Comments
- **Method:** `GET`
- **Route:** `/comments/post/:postId`
- **Auth:** Optional
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
- **Response:**
```json
{
  "message": "Comments retrieved successfully",
  "comments": [
    {
      "_id": "comment_id",
      "content": "Comment text",
      "author": { ... },
      "likes": [],
      "likeCount": 0,
      "replies": [
        {
          "_id": "reply_id",
          "content": "Reply text",
          "author": { ... }
        }
      ]
    }
  ],
  "totalComments": 25,
  "currentPage": 1
}
```

### Update Comment
- **Method:** `PUT`
- **Route:** `/comments/:id`
- **Auth:** Required (Author only)
- **Body:**
```json
{
  "content": "Updated comment text"
}
```
- **Response:**
```json
{
  "message": "Comment updated successfully",
  "comment": {
    "_id": "comment_id",
    "content": "Updated comment text",
    "isEdited": true,
    "editedAt": "timestamp"
  }
}
```

### Delete Comment
- **Method:** `DELETE`
- **Route:** `/comments/:id`
- **Auth:** Required (Author only)
- **Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

### Like Comment
- **Method:** `POST`
- **Route:** `/comments/:id/like`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "Comment liked/unliked successfully",
  "isLiked": true,
  "likeCount": 3
}
```

---

## 3. REACTIONS ENDPOINTS

### Add Reaction
- **Method:** `POST`
- **Route:** `/reactions`
- **Auth:** Required
- **Body:**
```json
{
  "type": "like",  // one of: like, love, haha, wow, sad, angry
  "postId": "post_id"  // OR
  // "commentId": "comment_id"
}
```
- **Response:**
```json
{
  "message": "Reaction added successfully",
  "reaction": {
    "_id": "reaction_id",
    "type": "like",
    "user": { ... },
    "post": "post_id",
    "emoji": "👍"
  }
}
```

### Get Reactions
- **Method:** `GET`
- **Route:** `/reactions`
- **Auth:** Optional
- **Query Parameters:**
  - `postId` - Get reactions for a post
  - `commentId` - Get reactions for a comment
- **Response:**
```json
{
  "message": "Reactions retrieved successfully",
  "reactions": [
    {
      "type": "like",
      "count": 5,
      "emoji": "👍",
      "users": [
        {
          "_id": "user_id",
          "name": "John",
          "avatar": "avatar_url"
        }
      ]
    }
  ],
  "total": 8
}
```

### Remove Reaction
- **Method:** `DELETE`
- **Route:** `/reactions/:reactionId`
- **Auth:** Required (Owner only)
- **Response:**
```json
{
  "message": "Reaction removed successfully"
}
```

### Get User Reactions
- **Method:** `GET`
- **Route:** `/reactions/user/my-reactions`
- **Auth:** Required
- **Response:**
```json
{
  "message": "User reactions retrieved successfully",
  "reactions": [...],
  "count": 15
}
```

---

## 4. NOTIFICATIONS ENDPOINTS

### Get User Notifications
- **Method:** `GET`
- **Route:** `/notifications`
- **Auth:** Required
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
- **Response:**
```json
{
  "message": "Notifications retrieved successfully",
  "notifications": [
    {
      "_id": "notification_id",
      "type": "like",  // like, comment, reply, follow
      "recipient": "user_id",
      "actor": {
        "_id": "actor_id",
        "name": "John Doe",
        "avatar": "avatar_url"
      },
      "post": { "_id": "post_id", "title": "..." },
      "comment": { "_id": "comment_id", "content": "..." },
      "message": "John liked your post",
      "read": false,
      "link": "/posts/post_id",
      "createdAt": "timestamp"
    }
  ],
  "totalNotifications": 12,
  "currentPage": 1
}
```

### Get Unread Notifications Count
- **Method:** `GET`
- **Route:** `/notifications/unread/count`
- **Auth:** Required
- **Response:**
```json
{
  "message": "Unread count retrieved",
  "unreadCount": 5
}
```

### Mark Notification as Read
- **Method:** `PUT`
- **Route:** `/notifications/:id/read`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read
- **Method:** `PUT`
- **Route:** `/notifications/read-all`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### Delete Notification
- **Method:** `DELETE`
- **Route:** `/notifications/:id`
- **Auth:** Required (Owner only)
- **Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## 5. USER ENDPOINTS

### Get User Profile
- **Method:** `GET`
- **Route:** `/users/:userId`
- **Auth:** Optional
- **Response:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar_url",
    "bio": "Student and tech enthusiast",
    "followers": [
      {
        "_id": "follower_id",
        "name": "Jane",
        "avatar": "avatar_url"
      }
    ],
    "following": [
      {
        "_id": "following_id",
        "name": "Admin",
        "avatar": "avatar_url"
      }
    ],
    "role": "user",
    "createdAt": "timestamp"
  }
}
```

### Update User Profile
- **Method:** `PUT`
- **Route:** `/users/profile/edit`
- **Auth:** Required
- **Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "New bio text",
  "avatar": "new_avatar_url"
}
```
- **Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe Updated",
    "bio": "New bio text",
    "avatar": "new_avatar_url"
  }
}
```

### Follow User
- **Method:** `POST`
- **Route:** `/users/:userId/follow`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "User followed successfully",
  "followingCount": 10,
  "followersCount": 5
}
```

### Unfollow User
- **Method:** `DELETE`
- **Route:** `/users/:userId/follow`
- **Auth:** Required
- **Body:** Empty
- **Response:**
```json
{
  "message": "User unfollowed successfully",
  "followingCount": 9,
  "followersCount": 4
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes:

### 400 Bad Request
```json
{
  "message": "Title and content are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication token is required"
}
```

### 403 Forbidden
```json
{
  "message": "You can only edit your own posts"
}
```

### 404 Not Found
```json
{
  "message": "Post not found"
}
```

### 500 Server Error
```json
{
  "message": "Failed to create post"
}
```

---

## Authentication
All authenticated endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

The token should be stored in localStorage as `user` after login.

---

## Reaction Types
- `like` - 👍
- `love` - ❤️
- `haha` - 😄
- `wow` - 😮
- `sad` - 😢
- `angry` - 😠

---

## Notification Types
- `like` - User liked your post/comment
- `comment` - User commented on your post
- `reply` - User replied to your comment
- `follow` - User followed you

---

## Notes
1. All timestamps are in ISO 8601 format
2. Pagination uses 1-based indexing
3. Posts and comments support nested data population
4. Cascading deletes prevent orphaned data
5. Edit tracking includes `isEdited` flag and `editedAt` timestamp
6. Notifications are automatically created for interactions (unless self-interaction)
7. Follow system is bidirectional (affects both followers and following arrays)
