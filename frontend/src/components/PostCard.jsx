import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { avatarPlaceholderStyle } from "../utils/avatarPlaceholderStyle";
import { postPreviewText } from "../utils/postPreview";
import "./PostCard.css";

/** Same outline thumbs-up as the footer Like button */
const THUMBS_UP_PATH =
  "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3";

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?._id ?? userData?.id;

  const postId = post._id;
  const [isLiked, setIsLiked] = useState(post.likes?.includes(userId));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const commentDisplayCount = Math.max(
    comments.length,
    Number(post.commentsCount) || 0,
  );

  const API_BASE = "http://localhost:5000/api";

  const authorId = String(
    post.author?._id ?? post.author?.id ?? post.author ?? "",
  ).trim();
  const currentUserId = String(userId ?? "").trim();
  const isAuthor = Boolean(
    token && authorId && currentUserId && authorId === currentUserId,
  );

  useEffect(() => {
    if (isEditing) return;
    setEditedContent(post.content);
  }, [post._id, post.content, isEditing]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Format date
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Handle like
  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsLiked(!isLiked);
      setLikeCount(
        response.data.post?.likeCount ||
          (isLiked ? likeCount - 1 : likeCount + 1),
      );
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/wall#post-${postId}`;
    const title = postPreviewText(post, 120) || "StudyShare post";
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert("Link copied to clipboard");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        window.alert("Link copied to clipboard");
      } catch (_) {
        window.prompt("Copy this link:", url);
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPostDeleted(postId);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(error.response?.data?.message || "Could not delete this post.");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      alert("Description cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE}/posts/${postId}`,
        {
          content: editedContent,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onPostUpdated(response.data.post);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
      alert(error.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      setCommentLoading(true);
      const response = await axios.post(
        `${API_BASE}/posts/${postId}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setComments([...comments, response.data.comment]);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment");
    } finally {
      setCommentLoading(false);
      }
  };

  // Handle comment like
const handleCommentLike = async (commentId) => {
  try {
    console.log("Like clicked:", commentId);
  } catch (err) {
    console.error("Failed to like comment", err);
  }
};

// Handle reply
const handleReply = (commentId) => {
  console.log("Reply clicked:", commentId);
  setCommentText(`@replying-to-${commentId} `);
};

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <div
            className="author-avatar"
            style={
              !post.author?.avatar
                ? avatarPlaceholderStyle(post.author)
                : undefined
            }
          >
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
            <div className="post-meta-line">
              <span className="post-date">{formatDate(post.createdAt)}</span>
              {post.isEdited && <span className="edited-badge">(edited)</span>}
            </div>
          </div>
        </div>

        {isAuthor && (
          <div className="post-card-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="post-card-menu-trigger"
              aria-label="Post options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <ul className="post-card-menu" role="menu">
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="post-card-menu-item"
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    Edit
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="post-card-menu-item post-card-menu-item--danger"
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                  >
                    Delete
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            placeholder="Description"
            rows="6"
          />
          <div className="edit-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                setIsEditing(false);
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
          <p className="post-body">{post.content}</p>

          {/* Display Photos */}
          {post.photos && post.photos.length > 0 && (
            <div className="post-photos-gallery">
              {post.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`${idx + 1}`}
                  className="post-photo"
                />
              ))}
            </div>
          )}

          {/* Display Video */}
          {post.video && (
            <div className="post-video-container">
              <video
                src={post.video}
                controls
                className="post-video"
                controlsList="nodownload"
              />
            </div>
          )}
        </div>
      )}

      <div className="post-stats" role="group" aria-label="Post engagement">
        <div className="post-stats-left">
          <span className="post-stats-like-row" aria-hidden="true">
            <svg
              className="post-stats-like-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={THUMBS_UP_PATH}
              />
            </svg>
          </span>
          <span className="post-stats-like-count">{likeCount}</span>
        </div>
        <button
          type="button"
          className="post-stats-comments"
          onClick={() => setShowComments((open) => !open)}
        >
          {commentDisplayCount}{" "}
          {commentDisplayCount === 1 ? "comment" : "comments"}
        </button>
      </div>

      <div className="post-footer">
        <button
          type="button"
          className={`post-footer-action ${isLiked ? "is-active" : ""}`}
          onClick={handleLike}
          aria-pressed={isLiked}
        >
          <svg
            className="post-footer-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={THUMBS_UP_PATH}
            />
          </svg>
          <span>Like</span>
        </button>
        <button
          type="button"
          className="post-footer-action"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
        >
          <svg
            className="post-footer-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337L5.05 21.5l1.192-3.273A8.915 8.915 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
          <span>Comment</span>
        </button>
        <button
          type="button"
          className={`post-footer-action ${isSaved ? "is-active" : ""}`}
          onClick={handleSave}
          aria-pressed={isSaved}
        >
          <svg
            className="post-footer-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
          </svg>
          <span>Save</span>
        </button>
        <button
          type="button"
          className="post-footer-action"
          onClick={handleShare}
          title="Share or copy link"
        >
          <svg
            className="post-footer-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm6 0h7.5"
            />
          </svg>
          <span>Send</span>
        </button>
      </div>

   {/* ================= COMMENTS ================= */}
{showComments && (
  <div className="comments-section">
    <div className="comments-header">
      <span>Most Relevant ▾</span>
    </div>

    <div className="comments-list">
      {comments.length > 0 ? (
        comments.map((comment, idx) => (
          <div key={idx} className="comment-item">

            {/* Avatar */}
            <div
              className="comment-avatar"
              style={
                !comment.author?.avatar
                  ? avatarPlaceholderStyle(comment.author)
                  : undefined
              }
            >
              {comment.author?.avatar ? (
                <img src={comment.author.avatar} alt={comment.author.name} />
              ) : (
                <div className="avatar-placeholder-small">
                  {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="comment-body">

              {/* Bubble */}
              <div className="comment-bubble">
                <strong>{comment.author?.name || "Anonymous"}</strong>
                <p className="comment-content">{comment.content}</p>
              </div>

              {/* Actions */}
              <div className="comment-actions-row">
                <span
                  className="comment-action"
                  onClick={() => handleCommentLike(comment._id)}
                >
                  Like
                </span>

                

                <span
                  className="comment-action"
                  onClick={() => handleReply(comment._id)}
                >
                  Reply
                </span>

                <span className="comment-date">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

            </div>
          </div>
        ))
      ) : (
        <p className="no-comments">No comments yet</p>
      )}
    </div>

    {/* ================= INPUT ================= */}
    <div className="comment-input-area">

      {/* Avatar */}
      <div
        className="comment-input-avatar"
        style={
          !userData?.avatar
            ? avatarPlaceholderStyle(userData)
            : undefined
        }
      >
        {userData?.avatar ? (
          <img src={userData.avatar} alt="You" />
        ) : (
          <div className="avatar-placeholder-small">
            {userData?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>

      {/* Input + Button */}
      <div className="comment-input-wrapper">
        <input
          type="text"
          className="comment-input"
          placeholder={`Comment as ${userData?.name || "User"}...`}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />

        <button
          className="comment-submit-btn"
          onClick={handleAddComment}
          disabled={commentLoading || !commentText.trim()}
        >
          {commentLoading ? "Posting..." : "Post"}
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default PostCard;
