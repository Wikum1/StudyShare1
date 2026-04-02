import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import feedWallService from "../../services/feedWall.service";
import { filterPostsByQuery } from "./feedSearchHelpers";
import FeedSidebarProfile from "./FeedSidebarProfile";
import "./feedWallPage.css";

export default function FeedWallPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [postMenuOpenFor, setPostMenuOpenFor] = useState(null); // postId | null
  const [feedSearchQuery, setFeedSearchQuery] = useState("");

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

  useEffect(() => {
    const tab = location.state?.feedTab;
    if (tab === "feed" || tab === "myPosts" || tab === "notifications" || tab === "savedPosts") {
      setActiveSection(tab);
    }
  }, [location.state?.feedTab]);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!postMenuOpenFor) return;
      const target = e.target;
      // Close if clicked outside any post menu container
      if (target && target.closest && !target.closest(".postMenuWrap")) {
        setPostMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [postMenuOpenFor]);

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

  const runSearchToPage = () => {
    const q = feedSearchQuery.trim();
    if (!q) return;
    const scope =
      activeSection === "myPosts"
        ? "myPosts"
        : activeSection === "savedPosts"
          ? "savedPosts"
          : "feed";
    const matches = filterPostsByQuery(posts, q, scope, userId);
    if (matches.length === 0) {
      setError("No posts match your search.");
      return;
    }
    setError("");
    navigate(
      `/dashboard/wall/feedSearch?q=${encodeURIComponent(q)}&scope=${encodeURIComponent(scope)}`
    );
  };

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

  // In this UI, the feed composer navigates to the full Create Post page.
  // Keeping old `createWallPost` behavior would duplicate submit logic and UI.

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

  const handleShare = async (post) => {
    const shareText = post?.content
      ? `Check this post: ${post.content}`
      : "Check this post!";
    const shareUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setError("Link copied to clipboard!");
        return;
      }
    } catch (e) {
      // fall through to prompt
    }

    // Fallback if clipboard is not available
    // eslint-disable-next-line no-alert
    alert(`${shareText}\n${shareUrl}`);
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

  const handleDeletePost = async (postId) => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    try {
      const idStr = postId.toString();
      await feedWallService.deletePost(idStr);
      setPosts((prev) => prev.filter((p) => p._id?.toString?.() !== idStr));
      setPostMenuOpenFor(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete post");
    }
  };

  return (
    <div className="feedLayoutPage">
      <div className="feedLayout">
        <aside className="feedSidebar">
          <FeedSidebarProfile user={user} />
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
          {activeSection === "feed" && (
            <div className="feedSearchWrap">
              <span className="feedSearchIcon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="search"
                className="feedSearchInput"
                placeholder="Search..."
                value={feedSearchQuery}
                onChange={(e) => setFeedSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearchToPage();
                  }
                }}
                aria-label="Search posts"
              />
            </div>
          )}

          {activeSection === "feed" && (
            <div
              className="composerCard"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/dashboard/wall/feedCreatePost")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate("/dashboard/wall/feedCreatePost");
                }
              }}
            >
              <div className="composerRow">
                <div className="composerAvatar">{(user?.name || "S")[0]}</div>

                <div className="composerForm">
                  <textarea
                    className="composerInput"
                    placeholder="What's on your mind?"
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    rows={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/dashboard/wall/feedCreatePost");
                    }}
                  />

                  <div className="composerSeparator" />

                  <div className="composerOptions">
                    <button
                      type="button"
                      className="composerOptionBtn composerOptionBtnPrimary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard/wall/feedCreatePost");
                      }}
                      disabled={posting}
                    >
                      <svg
                        className="composerTabIcon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                        <path d="M20.71 7.04a1.996 1.996 0 0 0 0-2.82l-2.34-2.34a1.996 1.996 0 0 0-2.82 0l-1.83 1.83 3.75 3.75 1.26-1.22z" />
                      </svg>
                      <span className="composerTabLabel">Compose</span>
                    </button>
                    <button
                      type="button"
                      className="composerOptionBtn composerOptionBtnPhoto"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard/wall/feedCreatePost");
                      }}
                      disabled={posting}
                    >
                      <svg
                        className="composerTabIcon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
                        <path d="M7.5 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="none" />
                        <path d="M21 19l-5.5-5.5a2 2 0 0 0-2.8 0L3 21" fill="none" />
                      </svg>
                      <span className="composerTabLabel">Photo</span>
                    </button>
                    <button
                      type="button"
                      className="composerOptionBtn composerOptionBtnVideo"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard/wall/feedCreatePost");
                      }}
                      disabled={posting}
                    >
                      <svg
                        className="composerTabIcon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5l4-2v-1l-4-2z" />
                        <path d="M10 9l6 3-6 3V9z" fill="none" />
                      </svg>
                      <span className="composerTabLabel">Video</span>
                    </button>
                  </div>

                  <div className="composerHiddenInputs">
                    <input
                      ref={photosInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) =>
                        setSelectedPhotos(Array.from(e.target.files || []))
                      }
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        setSelectedVideo(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== "feed" && (
            <div className="sectionHeader">
              <div className="sectionHeaderTitle">
                {activeSection === "myPosts"
                  ? "My posts"
                  : activeSection === "notifications"
                    ? "Notifications"
                    : "Saved posts"}
              </div>
              <div className="sectionHeaderSub">
                {activeSection === "myPosts"
                  ? "Posts you have created"
                  : activeSection === "notifications"
                    ? "Updates about likes and comments"
                    : "Posts you have bookmarked"}
              </div>
              <div className="sectionHeaderLine" />
            </div>
          )}

          {(activeSection === "myPosts" || activeSection === "savedPosts") && (
            <div className="feedSearchWrap feedSearchWrapBelowHeader">
              <span className="feedSearchIcon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="search"
                className="feedSearchInput"
                placeholder="Search..."
                value={feedSearchQuery}
                onChange={(e) => setFeedSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearchToPage();
                  }
                }}
                aria-label="Search posts"
              />
            </div>
          )}

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
                  : activeSection === "savedPosts"
                    ? "Save posts from the feed to see them here."
                    : "Be the first to share with your classmates."}
              </div>
            </div>
          ) : (
            <div className="wall-feed">
              {visiblePosts.map((post) => {
                const isCommentsOpen = Boolean(commentOpen[post._id]);
                const isMyPost = Boolean(userId && post.author && post.author.toString() === userId);
                return (
                  <div className="wall-post" key={post._id}>
                    <div className="postTopRow">
                      <div className="postAvatar">{(post.authorName || "S").trim()[0]}</div>
                      <div className="postMetaInfo">
                        <div className="post-author">{post.authorName}</div>
                        <div className="post-date">{timeAgo(post.createdAt)}</div>
                      </div>
                      <div className="postMenuWrap">
                        <button
                          type="button"
                          className="postMoreBtn"
                          aria-label="More"
                          onClick={(e) => {
                            e.stopPropagation();
                            const idStr = post._id?.toString?.() || "";
                            setPostMenuOpenFor((prev) => (prev === idStr ? null : idStr));
                          }}
                        >
                          ...
                        </button>

                        {postMenuOpenFor === (post._id?.toString?.() || "") && (
                          <div className="postMenu" role="menu">
                            {isMyPost ? (
                              <button
                                type="button"
                                className="postMenuItem postMenuItemDanger"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePost(post._id.toString());
                                }}
                              >
                                Delete
                              </button>
                            ) : (
                              <div className="postMenuEmpty">No actions</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

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
                        className={`fbActionBtn ${post.likedByMe ? "fbActionBtnActive" : ""}`}
                        onClick={() => handleToggleLike(post._id)}
                      >
                        <span className="fbActionIcon">👍</span>
                        <span className="fbActionLabel">Like</span>
                      </button>

                      <button
                        type="button"
                        className="fbActionBtn"
                        onClick={() => handleToggleComments(post._id)}
                      >
                        <span className="fbActionIcon">💬</span>
                        <span className="fbActionLabel">Comment</span>
                      </button>

                      <button
                        type="button"
                        className={`fbActionBtn ${post.savedByMe ? "fbActionBtnSaved" : ""}`}
                        onClick={() => handleToggleSave(post._id)}
                      >
                        <span className="fbActionIcon">🔖</span>
                        <span className="fbActionLabel">Save</span>
                      </button>

                      <button
                        type="button"
                        className="fbActionBtn"
                        onClick={() => handleShare(post)}
                      >
                        <span className="fbActionIcon">🔗</span>
                        <span className="fbActionLabel">Share</span>
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

