import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
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
  const [showSavedPosts, setShowSavedPosts] = useState(false);

  const location = useLocation();
  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        ...(searchQuery && { search: searchQuery })
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
    // Trigger sidebar refresh
    setRefreshSidebar(prev => prev + 1);
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
      />

      {/* Main Feed */}
      <main className="wall-main">
        <div className="wall-header">
          <h1>{showSavedPosts ? "📌 Saved Posts" : "StudyShare Wall"}</h1>
          <p>{showSavedPosts ? "Your bookmarked posts" : "Share knowledge, ask questions, and connect with peers"}</p>
        </div>

        <div className="wall-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <select 
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

            {token && (
              <>
                <button 
                  className={`btn-create-post ${showSavedPosts ? 'secondary' : ''}`}
                  onClick={() => {
                    setShowSavedPosts(!showSavedPosts);
                    setPage(1);
                  }}
                  title={showSavedPosts ? "Show all posts" : "Show saved posts"}
                >
                  🔖 {showSavedPosts ? "All Posts" : "Saved"}
                </button>

                <button 
                  className="btn-create-post"
                  onClick={() => setShowCreatePost(true)}
                >
                  + New Post
                </button>
              </>
            )}
          </div>
        </div>

        {showCreatePost && (
          <CreatePost 
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
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
