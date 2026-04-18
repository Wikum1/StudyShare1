import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useSearchParams } from "react-router-dom";
import { avatarPlaceholderStyle } from "../utils/avatarPlaceholderStyle";
import "./WallPage.css";
import WallSidebar from "../components/WallSidebar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

const WallPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostPicker, setCreatePostPicker] = useState(null);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSavedPostsView = searchParams.get("saved") === "1";

  useEffect(() => {
    setShowSavedPosts(isSavedPostsView);
  }, [isSavedPostsView]);
  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const [userData, setUserData] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  useEffect(() => {
    const syncUser = () =>
      setUserData(JSON.parse(localStorage.getItem("user") || "{}"));
    window.addEventListener("studyshare-user-updated", syncUser);
    return () => window.removeEventListener("studyshare-user-updated", syncUser);
  }, []);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, searchQuery, showSavedPosts]);

  // Scroll to post when navigated from notification
  useEffect(() => {
    if (location.state?.scrollToPostId) {
      setTimeout(() => {
        const postElement = document.getElementById(`post-${location.state.scrollToPostId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
          postElement.classList.add("highlight-post");
          setTimeout(() => {
            postElement.classList.remove("highlight-post");
          }, 3000);
        }
      }, 300);
    }
  }, [location.state]);

  // Scroll to post from shared link (#post-{id})
  useEffect(() => {
    if (loading) return;
    const raw = window.location.hash?.replace(/^#/, "") || "";
    if (!raw.startsWith("post-")) return;
    const el = document.getElementById(raw);
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-post");
      setTimeout(() => el.classList.remove("highlight-post"), 3000);
    }, 150);
    return () => clearTimeout(t);
  }, [loading, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        ...(!showSavedPosts && searchQuery && { search: searchQuery })
      };

      let url = `${API_BASE}/posts`;
      let response;
      let headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (showSavedPosts) {
        url = `${API_BASE}/posts/user/saved`;
        response = await axios.get(url, { params, headers });
      } else {
        response = await axios.get(url, { params });
      }

      // Handle response safely
      const postsData = response.data.posts || response.data.savedPosts || [];
      const paginationData = response.data.pagination || { totalPages: 1 };
      
      setPosts(postsData);
      setTotalPages(paginationData.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    setCreatePostPicker(null);
  };

  const openCreatePost = (intent = "compose") => {
    setCreatePostPicker(intent);
    setShowCreatePost(true);
  };

  const closeCreatePost = () => {
    setShowCreatePost(false);
    setCreatePostPicker(null);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="wall-page-container">
      {/* Sidebar */}
      <WallSidebar 
        posts={posts} 
        userData={userData}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
        refreshSidebar={refreshSidebar}
      />

      {/* Main Feed */}
      <main className="wall-main">
        <div className="wall-controls">
          {showSavedPosts ? (
            <header className="wall-saved-header">
              <h2 className="wall-saved-title">Saved posts</h2>
              <p className="wall-saved-subtitle">Posts you have bookmarked</p>
              <div className="wall-saved-header-rule" aria-hidden="true" />
            </header>
          ) : (
            <div className="search-section">
              <div className="wall-search-shell">
                <span className="wall-search-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.803 15.803 21 21"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                  aria-label="Search posts"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {token && !showSavedPosts && (
            <div className="wall-composer-card">
              <div className="wall-composer-top">
                <div
                  className="wall-composer-avatar"
                  aria-hidden="true"
                  style={
                    !userData?.avatar ? avatarPlaceholderStyle(userData) : undefined
                  }
                >
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt="" />
                  ) : (
                    <span className="wall-composer-avatar-placeholder">
                      {(userData?.name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="wall-composer-trigger"
                  onClick={() => openCreatePost("compose")}
                >
                  What&apos;s on your mind?
                </button>
              </div>
              <div className="wall-composer-divider" aria-hidden="true" />
              <div className="wall-composer-actions">
                <button
                  type="button"
                  className="wall-composer-action wall-composer-action--compose"
                  onClick={() => openCreatePost("compose")}
                >
                  <span className="wall-composer-action-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Compose</span>
                </button>
                <button
                  type="button"
                  className="wall-composer-action wall-composer-action--photo"
                  onClick={() => openCreatePost("photo")}
                >
                  <span className="wall-composer-action-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  className="wall-composer-action wall-composer-action--video"
                  onClick={() => openCreatePost("video")}
                >
                  <span className="wall-composer-action-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Video</span>
                </button>
              </div>
            </div>
          )}

          <div className="filter-section">
            <div className="wall-filter-sort">
              <span className="wall-sort-label">Sort</span>
              <select
                id="wall-sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="sort-select"
              >
                <option value="createdAt">Latest</option>
                <option value="likeCount">Most Liked</option>
              </select>
            </div>
          </div>
        </div>

        {showCreatePost && (
          <CreatePost
            onClose={closeCreatePost}
            onPostCreated={handlePostCreated}
            pickerIntent={
              createPostPicker === "photo" || createPostPicker === "video"
                ? createPostPicker
                : null
            }
          />
        )}

        <div className="posts-section">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts found. Be the first to share!</p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <div key={post._id} id={`post-${post._id}`}>
                  <PostCard
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-pagination"
            >
              Previous
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-pagination"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WallPage;
