import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Wall.css";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

const Wall = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?._id;

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [page, sortBy, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        ...(searchQuery && { search: searchQuery })
      };

      const response = await axios.get(`${API_BASE}/posts`, { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
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
    <div className="wall-container">
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
            <button 
              className="btn-create-post"
              onClick={() => setShowCreatePost(true)}
            >
              + New Post
            </button>
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
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
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
    </div>
  );
};

export default Wall;
