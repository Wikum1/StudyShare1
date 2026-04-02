import React, { useState } from "react";
import axios from "axios";
import "./CreatePost.css";

const CreatePost = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const token = userData?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      const tagsArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      const response = await axios.post(
        `${API_BASE}/posts`,
        {
          title: title.trim(),
          content: content.trim(),
          tags: tagsArray
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onPostCreated(response.data.post);
      setTitle("");
      setContent("");
      setTags("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-header">
          <h2>Create New Post</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="200"
              className="form-input"
            />
            <span className="char-count">{title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or provide helpful information..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="8"
              className="form-textarea"
            />
            <span className="char-count">{content.length} characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              placeholder="e.g., math, study-tips, questions"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="form-input"
            />
            <span className="hint">Separate tags with commas</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
