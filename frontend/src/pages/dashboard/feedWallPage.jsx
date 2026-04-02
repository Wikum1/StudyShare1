import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import feedWallService from "../../services/feedWall.service";
import "./feedWallPage.css";

export default function FeedWallPage() {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const userId = user?.id ? user.id.toString() : null;

  const [activeSection, setActiveSection] = useState("feed"); // feed | myPosts | notifications | savedPosts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Composer state
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [posting, setPosting] = useState(false);

  // Comment state (per post)
  const [commentOpen, setCommentOpen] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  const photosInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await feedWallService.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load wall posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      setError("Please login to view the wall.");
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visiblePosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    switch (activeSection) {
      case "myPosts":
        return userId ? posts.filter((p) => (p.author || "").toString() === userId) : [];
      case "savedPosts":
        return posts.filter((p) => Boolean(p.savedByMe));
      case "feed":
      default:
        return posts;
    }
  }, [posts, activeSection, userId]);

  const timeAgo = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getFileUrl = (p) => {
    if (!p) return "";
    const normalized = p.toString().replace(/\\/g, "/");
    return `http://localhost:5000/${normalized}`;
  };

  const createWallPost = async () => {
    if (!user?.token) {
      setError("Please login to create posts.");
      return;
    }

    const fd = new FormData();
    const trimmed = descriptionText.trim();
    const hasText = Boolean(trimmed);
    const hasMedia = selectedPhotos.length > 0 || Boolean(selectedVideo);

    if (!hasText && !hasMedia) {
      setError("Write something or add photos/videos to post.");
      return;
    }

    // Screenshot-style composer doesn't have a separate topic input.
    // We store the first line/preview in `topic` and the full textarea in `description`.
    fd.append("topic", trimmed ? trimmed.slice(0, 120) : "");
    fd.append("description", trimmed);

    for (const f of selectedPhotos) {
      fd.append("photos", f);
    }
    if (selectedVideo) fd.append("video", selectedVideo);

    try {
      setPosting(true);
      setError("");
      const created = await feedWallService.createPost(fd);
      setPosts((prev) => [created, ...prev]);
      setDescriptionText("");
      setSelectedPhotos([]);
      setSelectedVideo(null);
      setActiveSection("feed");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const updated = await feedWallService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === updated.postId
            ? { ...p, likeCount: updated.likeCount, likedByMe: updated.likedByMe }
            : p
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to like post");
    }
  };

  const handleToggleSave = async (postId) => {
    try {
      const updated = await feedWallService.toggleSave(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === updated.postId
            ? { ...p, saveCount: updated.saveCount, savedByMe: updated.savedByMe }
            : p
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save post");
    }
  };

  const handleToggleComments = (postId) => {
    setCommentOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    const content = (commentDrafts[postId] || "").trim();
    if (!content) return;
    try {
      const updated = await feedWallService.addComment(postId, { content });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === updated.postId
            ? { ...p, comments: updated.comments, commentCount: updated.commentCount }
            : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to add comment");
    }
  };

  return (
    <div className="feedLayoutPage">
      <div className="feedLayout">
        <aside className="feedSidebar">
          <button
            type="button"
            className={`feedSidebarItem ${activeSection === "feed" ? "active" : ""}`}
            onClick={() => setActiveSection("feed")}
          >
            Feed
          </button>
          <button
            type="button"
            className={`feedSidebarItem ${activeSection === "myPosts" ? "active" : ""}`}
            onClick={() => setActiveSection("myPosts")}
          >
            My posts
          </button>
          <button
            type="button"
            className={`feedSidebarItem ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            Notifications
          </button>
          <button
            type="button"
            className={`feedSidebarItem ${activeSection === "savedPosts" ? "active" : ""}`}
            onClick={() => setActiveSection("savedPosts")}
          >
            Saved posts
          </button>
        </aside>

        <main className="feedMain">
          <div className="feedHeader">
            <div>
              <h1 className="feedMainTitle">Feed</h1>
              <p className="feedMainSubtitle">Create posts, like, comment and save</p>
            </div>
          </div>

          <div className="composerCard">
            <div className="composerRow">
              <div className="composerAvatar">{(user?.name || "S")[0]}</div>

              <div className="composerForm">
                <textarea
                  className="composerInput"
                  placeholder="What's on your mind?"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  rows={1}
                />

                <div className="composerSeparator" />

                <div className="composerOptions">
                  <button
                    type="button"
                    className="composerOptionBtn composerOptionBtnPrimary"
                    onClick={createWallPost}
                    disabled={posting}
                  >
                    ✏️ Compose
                  </button>
                  <button
                    type="button"
                    className="composerOptionBtn composerOptionBtnPhoto"
                    onClick={() => photosInputRef.current?.click()}
                    disabled={posting}
                  >
                    🖼️ Photo
                  </button>
                  <button
                    type="button"
                    className="composerOptionBtn composerOptionBtnVideo"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={posting}
                  >
                    🎥 Video
                  </button>
                </div>

                <div className="composerHiddenInputs">
                  <input
                    ref={photosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => setSelectedPhotos(Array.from(e.target.files || []))}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="wall-error">{error}</div>}

          {loading ? (
            <p className="wall-loading">Loading...</p>
          ) : activeSection === "notifications" ? (
            <div className="wall-empty">
              <div className="wall-empty-title">No notifications yet</div>
              <div className="wall-empty-sub">When someone likes or comments, you will see it here.</div>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="wall-empty">
              <div className="wall-empty-title">No posts found</div>
              <div className="wall-empty-sub">
                {activeSection === "myPosts"
                  ? "Create your first post to get started."
                  : "Be the first to share with your classmates."}
              </div>
            </div>
          ) : (
            <div className="wall-feed">
              {visiblePosts.map((post) => {
                const isCommentsOpen = Boolean(commentOpen[post._id]);
                return (
                  <div className="wall-post" key={post._id}>
                    <div className="postTopRow">
                      <div className="postAvatar">{(post.authorName || "S").trim()[0]}</div>
                      <div className="postMetaInfo">
                        <div className="post-author">{post.authorName}</div>
                        <div className="post-date">{timeAgo(post.createdAt)}</div>
                      </div>
                      <button type="button" className="postMoreBtn" onClick={() => {}} aria-label="More">
                        ...
                      </button>
                    </div>

                    {post.topic && post.topic.trim() && <div className="postTopic">{post.topic}</div>}
                    <div className="post-content">{post.content}</div>

                    {post.photos && post.photos.length > 0 && (
                      <div className="postPhotosGrid">
                        {post.photos.map((ph, idx) => (
                          <img key={`${post._id}-ph-${idx}`} className="postPhoto" src={getFileUrl(ph)} alt="Post photo" />
                        ))}
                      </div>
                    )}

                    {post.videoUrl && (
                      <div className="postVideoWrap">
                        <video className="postVideo" src={getFileUrl(post.videoUrl)} controls />
                      </div>
                    )}

                    <div className="post-actions">
                      <button
                        type="button"
                        className={`action-btn ${post.likedByMe ? "active" : ""}`}
                        onClick={() => handleToggleLike(post._id)}
                      >
                        👍 Like ({post.likeCount || 0})
                      </button>

                      <button type="button" className="action-btn" onClick={() => handleToggleComments(post._id)}>
                        💬 Comment ({post.commentCount || 0})
                      </button>

                      <button
                        type="button"
                        className={`action-btn ${post.savedByMe ? "active-save" : ""}`}
                        onClick={() => handleToggleSave(post._id)}
                      >
                        🔖 Save ({post.saveCount || 0})
                      </button>
                    </div>

                    {isCommentsOpen && (
                      <div className="comments-section">
                        <div className="comments-list">
                          {(post.comments || []).map((c, idx) => (
                            <div className="comment" key={`${post._id}-c-${idx}`}>
                              <div className="comment-author">{c.authorName}</div>
                              <div className="comment-text">{c.content}</div>
                              <div className="comment-date">{timeAgo(c.createdAt)}</div>
                            </div>
                          ))}
                        </div>

                        <div className="comment-form">
                          <input
                            className="comment-input"
                            placeholder="Write a comment..."
                            value={commentDrafts[post._id] || ""}
                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                          />
                          <button className="secondary-btn" type="button" onClick={() => handleAddComment(post._id)}>
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

