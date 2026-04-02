import React, { useState } from "react";
import axios from "axios";
import "./PostCard.css";
import ReactionPicker from "./ReactionPicker";

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const token = userData?.token;
  const userId = userData?._id;

  // Simple approach: just use the ID as-is
  const postId = post._id;
  
  console.log("📦 PostCard - postId:", postId);
  console.log("📦 PostCard - postId type:", typeof postId);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(userId));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  
  // Safely compare IDs (convert to strings and trim)
  const authorId = String(post.author?._id || "").trim();
  const currentUserId = String(userId || "").trim();
  const isAuthor = authorId && currentUserId && authorId === currentUserId;
  
  console.log("👤 Author check:");
  console.log("   post.author._id:", post.author?._id);
  console.log("   authorId (string):", authorId);
  console.log("   userId:", userId);
  console.log("   currentUserId (string):", currentUserId);
  console.log("   isAuthor:", isAuthor);
  console.log("   Full user data:", userData);

  // Format date
  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Handle like
  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked(!isLiked);
      setLikeCount(response.data.post?.likeCount || (isLiked ? likeCount - 1 : likeCount + 1));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      await axios.post(
        `${API_BASE}/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(
        `${API_BASE}/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostDeleted(postId);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE}/posts/${postId}`,
        {
          title: editedTitle,
          content: editedContent
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdated(response.data.post);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <div className="author-avatar">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} />
            ) : (
              <div className="avatar-placeholder">
                {post.author?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="author-details">
            <h3 className="author-name">{post.author?.name || "Anonymous"}</h3>
            <span className="post-date">{formatDate(post.createdAt)}</span>
            {post.isEdited && <span className="edited-badge">(edited)</span>}
          </div>
        </div>

        {isAuthor && (
          <div className="post-actions">
            <button
              className="btn-action"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="edit-input"
            placeholder="Post title"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            placeholder="Post content"
            rows="6"
          />
          <div className="edit-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(post.title);
                setEditedContent(post.content);
              }}
            >
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="post-content">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-body">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="post-stats">
        <span className="stat">
          <strong>{likeCount}</strong> Likes
        </span>
        <span className="stat">
          <strong>{post.views || 0}</strong> Views
        </span>
      </div>

      <div className="post-footer">
        <button
          className={`btn-action ${isLiked ? "active" : ""}`}
          onClick={handleLike}
        >
          👍 Like
        </button>
        <button
          className="btn-action"
          onClick={() => setShowReactions(!showReactions)}
        >
          😊 React
        </button>
        <button
          className={`btn-action ${isSaved ? "active" : ""}`}
          onClick={handleSave}
        >
          🔖 Save
        </button>
        
        {isAuthor && (
          <>
            <button
              className={`btn-action ${isEditing ? "active" : ""}`}
              onClick={() => setIsEditing(!isEditing)}
              title="Edit post"
            >
              ✎ Edit
            </button>
            <button
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete post"
            >
              🗑 Delete
            </button>
          </>
        )}
      </div>

      {showReactions && (
        <ReactionPicker postId={postId} onReactionAdded={() => {}} />
      )}
    </div>
  );
};

export default PostCard;
