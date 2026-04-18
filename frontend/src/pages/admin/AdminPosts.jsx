import { useEffect, useState } from "react";
import { postPreviewText } from "../../utils/postPreview";
import "./AdminPosts.css";

export default function AdminPosts() {
  const token = localStorage.getItem("token");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load posts");
        setPosts([]);
        return;
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error(err);
      setMessage("Server error while loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete post");
        return;
      }

      setMessage("Post deleted successfully");
      fetchPosts();
    } catch (err) {
      console.error(err);
      setMessage("Server error while deleting post");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete comment");
        return;
      }

      setMessage("Comment deleted successfully");
      fetchPosts();
    } catch (err) {
      console.error(err);
      setMessage("Server error while deleting comment");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="admin-posts-page">
      <div className="admin-posts-header">
        <div>
          <p className="admin-posts-breadcrumb">Admin / Wall Management</p>
          <h1>Wall Management</h1>
          <p className="admin-posts-subtitle">
            Review student wall posts, monitor discussions, and remove unwanted
            posts or comments from one place.
          </p>
        </div>

        <div className="admin-posts-summary">
          <div className="summary-card">
            <span>Total Posts</span>
            <strong>{posts.length}</strong>
          </div>
          <div className="summary-card">
            <span>Total Comments</span>
            <strong>
              {posts.reduce(
                (total, post) =>
                  total + (Array.isArray(post.comments) ? post.comments.length : 0),
                0
              )}
            </strong>
          </div>
        </div>
      </div>

      {message && <div className="admin-posts-alert">{message}</div>}

      {loading ? (
        <div className="admin-posts-loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="admin-posts-empty">
          <div className="empty-icon">📝</div>
          <h3>No posts found</h3>
          <p>There are no wall posts available right now.</p>
        </div>
      ) : (
        <div className="admin-posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="admin-post-card">
              <div className="admin-post-top">
                <div className="admin-post-title-wrap">
                  <h3>{postPreviewText(post, 100) || "Post"}</h3>
                  <span className="post-date">
                    {formatDate(post.createdAt || post.updatedAt)}
                  </span>
                </div>

                <button
                  className="delete-post-btn"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Delete Post
                </button>
              </div>

              <div className="admin-post-meta">
                <span className="meta-badge">
                  <strong>Author:</strong> {post.author?.name || "Unknown"}
                </span>
                <span className="meta-badge">
                  <strong>Comments:</strong>{" "}
                  {Array.isArray(post.comments) ? post.comments.length : 0}
                </span>
              </div>

              <p className="admin-post-content">{post.content}</p>

              <div className="admin-comments-section">
                <div className="comments-header">
                  <h4>Comments</h4>
                </div>

                {post.comments && post.comments.length > 0 ? (
                  <div className="comments-list">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="comment-card">
                        <div className="comment-top">
                          <div>
                            <p className="comment-author">
                              {comment.author?.name || "Unknown"}
                            </p>
                            <p className="comment-date">
                              {formatDate(comment.createdAt || comment.updatedAt)}
                            </p>
                          </div>

                          <button
                            className="delete-comment-btn"
                            onClick={() =>
                              handleDeleteComment(post._id, comment._id)
                            }
                          >
                            Delete Comment
                          </button>
                        </div>

                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comments">No comments available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}