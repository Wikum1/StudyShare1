import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./CreatePost.css";

const CreatePost = ({ onClose, onPostCreated, pickerIntent = null }) => {
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (pickerIntent === "photo") {
      const t = setTimeout(() => photoInputRef.current?.click(), 150);
      return () => clearTimeout(t);
    }
    if (pickerIntent === "video") {
      const t = setTimeout(() => videoInputRef.current?.click(), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [pickerIntent]);

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Max 10 photos
    if (files.length + photos.length > 10) {
      setError("Maximum 10 photos allowed");
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError("");
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Check file size (max 5MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      setError(`Video must be under 5MB. Your file is ${fileSizeMB.toFixed(2)}MB`);
      return;
    }

    setVideo(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreviews(reader.result);
    };
    reader.readAsDataURL(file);

    setError("");
  };

  // Remove photo
  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  // Remove video
  const removeVideo = () => {
    setVideo(null);
    setVideoPreviews(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());

      // Add photos
      photos.forEach(photo => {
        formData.append("files", photo);
      });

      // Add video
      if (video) {
        formData.append("files", video);
      }

      const response = await axios.post(
        `${API_BASE}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      onPostCreated(response.data.post);
      setTitle("");
      setContent("");
      setPhotos([]);
      setPhotoPreviews([]);
      setVideo(null);
      setVideoPreviews(null);
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

          {/* Photo Upload */}
          <div className="form-group">
            <label htmlFor="photos">Add Photos (max 10)</label>
            <input
              ref={photoInputRef}
              id="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoSelect}
              className="form-input-file"
            />
            <span className="hint">JPEG, PNG, GIF, WebP • {photos.length}/10 photos</span>
          </div>

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="media-previews">
              <div className="photos-grid">
                {photoPreviews.map((preview, idx) => (
                  <div key={idx} className="photo-preview">
                    <img src={preview} alt={`Preview ${idx}`} />
                    <button
                      type="button"
                      className="btn-remove-media"
                      onClick={() => removePhoto(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Upload */}
          <div className="form-group">
            <label htmlFor="video">Add Video (max 1, under 5MB)</label>
            <input
              ref={videoInputRef}
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="form-input-file"
              disabled={!!video}
            />
            <span className="hint">MP4, MPEG, MOV, AVI • Max 5MB</span>
          </div>

          {/* Video Preview */}
          {videoPreviews && (
            <div className="media-previews">
              <div className="video-preview">
                <video src={videoPreviews} controls />
                <button
                  type="button"
                  className="btn-remove-media"
                  onClick={removeVideo}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

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
