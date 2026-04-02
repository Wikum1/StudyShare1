import { useMemo, useState } from "react";
import feedWallService from "../../services/feedWall.service";
import "./feedCreatePost.css";
import { useNavigate } from "react-router-dom";

export default function FeedCreatePost() {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // File[]
  const [video, setVideo] = useState(null); // File | null
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const maxChars = 2000;
  const count = description.length;

  const canSubmit =
    Boolean(user?.token) &&
    (description.trim().length > 0 || photos.length > 0 || Boolean(video));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user?.token) {
      setError("Please login first.");
      return;
    }

    const trimmedDescription = description.trim();

    const hasText = Boolean(trimmedDescription);
    const hasMedia = photos.length > 0 || Boolean(video);

    if (!hasText && !hasMedia) {
      setError("Please add a description or upload photos/video.");
      return;
    }

    const fd = new FormData();
    fd.append("topic", "");
    fd.append("description", trimmedDescription);
    // Optional media
    for (const f of photos) fd.append("photos", f);
    if (video) fd.append("video", video);

    try {
      setPosting(true);
      await feedWallService.createPost(fd);
      navigate("/dashboard/wall");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create post failed");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="feedCreatePage">
      <div className="feedCreateCard">
        <h1 className="feedCreateTitle">Create a new post</h1>
        <p className="feedCreateSubtitle">Share your thoughts with the community</p>

        <form className="feedCreateForm" onSubmit={onSubmit}>
          <label className="feedFieldLabel">Description</label>
          <textarea
            className="feedFieldTextarea"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
            placeholder="What's on your mind?"
            maxLength={maxChars}
          />

          <div className="feedCharCount">
            {count}/{maxChars} characters
          </div>

          <label className="feedFieldLabel feedFieldLabelSpaceTop">Photos (optional, up to 12)</label>
          <input
            className="feedFieldFile"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setError("");

              if (files.length > 12) {
                setError("You can upload up to 12 photos.");
              }

              // If user selects photos, clear any video selection.
              setVideo(null);
              setPhotos(files.slice(0, 12));
            }}
          />

          <label className="feedFieldLabel feedFieldLabelSpaceTop">Video (optional, one)</label>
          <input
            className="feedFieldFile"
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setError("");

              // If user selects a video, clear any photo selection.
              setPhotos([]);
              setVideo(f);
            }}
          />

          {error && <div className="feedCreateError">{error}</div>}

          <button className="feedCreateBtn" type="submit" disabled={!canSubmit || posting}>
            {posting ? "Creating..." : "Create Post"}
          </button>
        </form>

        <button type="button" className="feedCreateBackBtn" onClick={() => navigate("/dashboard/wall")}>
          Back
        </button>
      </div>
    </div>
  );
}

