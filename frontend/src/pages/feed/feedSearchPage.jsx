import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import feedWallService from "../../services/feedWall.service";
import { filterPostsByQuery, HighlightedText } from "./feedSearchHelpers";
import FeedSidebarProfile from "./FeedSidebarProfile";
import "./feedWallPage.css";
import "./feedSearchPage.css";

export default function FeedSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const userId = user?.id ? user.id.toString() : null;

  const qFromUrl = (searchParams.get("q") || "").trim();
  const scopeRaw = searchParams.get("scope") || "feed";
  const scope =
    scopeRaw === "myPosts" ? "myPosts" : scopeRaw === "savedPosts" ? "savedPosts" : "feed";

  const [inputQ, setInputQ] = useState(qFromUrl);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentOpen, setCommentOpen] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postMenuOpenFor, setPostMenuOpenFor] = useState(null);

  useEffect(() => {
    setInputQ(qFromUrl);
  }, [qFromUrl]);

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
      setError("Please login to search the wall.");
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!postMenuOpenFor) return;
      const target = e.target;
      if (target && target.closest && !target.closest(".postMenuWrap")) {
        setPostMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [postMenuOpenFor]);

  const results = useMemo(
    () => filterPostsByQuery(posts, qFromUrl, scope, userId),
    [posts, qFromUrl, scope, userId]
  );

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

  const goWall = (tab) => {
    navigate("/dashboard/wall", { state: { feedTab: tab } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const submitSearch = () => {
    const q = inputQ.trim();
    if (!q) return;
    setSearchParams({ q, scope });
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

  const handleShare = async (post) => {
    const shareText = post?.content
      ? `Check this post: ${post.content}`
      : "Check this post!";
    const shareUrl = `${window.location.origin}/dashboard/wall`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setError("Link copied to clipboard!");
        return;
      }
    } catch (e) {
      // fall through
    }
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

  const sidebarActive = (tab) => {
    if (tab === "feed") return scope === "feed";
    if (tab === "myPosts") return scope === "myPosts";
    if (tab === "savedPosts") return scope === "savedPosts";
    return false;
  };

  return (
    <div className="feedLayoutPage">
      <div className="feedLayout">
        <aside className="feedSidebar">
          <FeedSidebarProfile user={user} />
          <button
            type="button"
            className={`feedSidebarItem ${sidebarActive("feed") ? "active" : ""}`}
            onClick={() => goWall("feed")}
          >
            Feed
          </button>
          <button
            type="button"
            className={`feedSidebarItem ${sidebarActive("myPosts") ? "active" : ""}`}
            onClick={() => goWall("myPosts")}
          >
            My posts
          </button>
          <button type="button" className="feedSidebarItem" onClick={() => goWall("notifications")}>
            Notifications
          </button>
          <button
            type="button"
            className={`feedSidebarItem ${sidebarActive("savedPosts") ? "active" : ""}`}
            onClick={() => goWall("savedPosts")}
          >
            Saved posts
          </button>
        </aside>

        <main className="feedMain">
          <div className="feedSearchPageBar">
            <button type="button" className="feedSearchBackBtn" onClick={handleBack} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="feedSearchWrap">
              <span className="feedSearchIcon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="search"
                className="feedSearchInput"
                placeholder="Search..."
                value={inputQ}
                onChange={(e) => setInputQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitSearch();
                  }
                }}
                aria-label="Search posts"
              />
            </div>
          </div>

          {error && <div className="wall-error">{error}</div>}

          {loading ? (
            <p className="wall-loading">Loading...</p>
          ) : !qFromUrl ? (
            <div className="wall-empty">
              <div className="wall-empty-title">Search the wall</div>
              <div className="wall-empty-sub">Type a keyword and press Enter.</div>
            </div>
          ) : results.length === 0 ? (
            <div className="wall-empty">
              <div className="wall-empty-title">No posts match your search</div>
              <div className="wall-empty-sub">Try different words or go back to the feed.</div>
            </div>
          ) : (
            <div className="wall-feed">
              {results.map((post) => {
                const isCommentsOpen = Boolean(commentOpen[post._id]);
                const isMyPost = Boolean(userId && post.author && post.author.toString() === userId);
                return (
                  <div className="wall-post" key={post._id}>
                    <div className="postTopRow">
                      <div className="postAvatar">{(post.authorName || "S").trim()[0]}</div>
                      <div className="postMetaInfo">
                        <HighlightedText
                          as="div"
                          className="post-author"
                          text={post.authorName || ""}
                          query={qFromUrl}
                        />
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

                    <HighlightedText
                      as="div"
                      className="post-content"
                      text={post.content || ""}
                      query={qFromUrl}
                    />

                    {post.photos && post.photos.length > 0 && (
                      <div className="postPhotosGrid">
                        {post.photos.map((ph, idx) => (
                          <img
                            key={`${post._id}-ph-${idx}`}
                            className="postPhoto"
                            src={getFileUrl(ph)}
                            alt="Post attachment"
                          />
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

                      <button type="button" className="fbActionBtn" onClick={() => handleShare(post)}>
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
                              <HighlightedText
                                as="div"
                                className="comment-text"
                                text={c.content || ""}
                                query={qFromUrl}
                              />
                              <div className="comment-date">{timeAgo(c.createdAt)}</div>
                            </div>
                          ))}
                        </div>

                        <div className="comment-form">
                          <input
                            className="comment-input"
                            placeholder="Write a comment..."
                            value={commentDrafts[post._id] || ""}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                            }
                          />
                          <button
                            className="secondary-btn"
                            type="button"
                            onClick={() => handleAddComment(post._id)}
                          >
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
