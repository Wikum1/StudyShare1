import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./WallPage.css";
import WallSidebar from "../components/WallSidebar";
import PostCard from "../components/PostCard";

const MyWallPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
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

  useEffect(() => {
    const fetchMine = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/posts/user/my-posts`, {
          params: { page, limit: 10 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data.posts || []);
        const p = response.data.pagination;
        setTotalPages(p?.pages || 1);
      } catch (error) {
        console.error("Failed to fetch your posts:", error);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, [page, token]);

  useEffect(() => {
    if (location.state?.scrollToPostId) {
      setTimeout(() => {
        const el = document.getElementById(`post-${location.state.scrollToPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight-post");
          setTimeout(() => el.classList.remove("highlight-post"), 3000);
        }
      }, 300);
    }
  }, [location.state]);

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updated) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  return (
    <div className="wall-page-container">
      <WallSidebar
        posts={posts}
        userData={userData}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
      />

      <main className="wall-main">
        <div className="wall-controls">
          <header className="wall-saved-header">
            <h2 className="wall-saved-title">My posts</h2>
            <p className="wall-saved-subtitle">Posts you have shared on the wall</p>
            <div className="wall-saved-header-rule" aria-hidden="true" />
          </header>
        </div>

        <div className="posts-section">
          {loading ? (
            <div className="loading">Loading your posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <p>You have not created any posts yet.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
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
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-pagination"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

export default MyWallPostsPage;
