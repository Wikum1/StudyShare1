import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReactionPicker.css";

const ReactionPicker = ({ postId, commentId, onReactionAdded }) => {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const token = userData?.token;
  const userId = userData?._id;

  const reactionTypes = [
    { type: "like", emoji: "👍" },
    { type: "love", emoji: "❤️" },
    { type: "haha", emoji: "😄" },
    { type: "wow", emoji: "😮" },
    { type: "sad", emoji: "😢" },
    { type: "angry", emoji: "😠" }
  ];

  // Fetch reactions
  useEffect(() => {
    fetchReactions();
  }, [postId, commentId]);

  const fetchReactions = async () => {
    try {
      const params = {};
      if (postId) params.postId = postId;
      if (commentId) params.commentId = commentId;

      const response = await axios.get(`${API_BASE}/reactions`, { params });
      setReactions(response.data.reactions || []);

      // Check user's reaction
      response.data.reactions.forEach(reaction => {
        if (reaction.users?.some(u => u._id === userId)) {
          setUserReaction(reaction.type);
        }
      });
    } catch (error) {
      console.error("Failed to fetch reactions:", error);
    }
  };

  // Add reaction
  const handleAddReaction = async (type) => {
    if (!token) {
      alert("Please login to react");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type,
        ...(postId && { postId }),
        ...(commentId && { commentId })
      };

      await axios.post(`${API_BASE}/reactions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserReaction(type);
      onReactionAdded?.();
      fetchReactions();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reaction-picker">
      <div className="reaction-emojis">
        {reactionTypes.map(reaction => (
          <button
            key={reaction.type}
            className={`emoji-btn ${userReaction === reaction.type ? "active" : ""}`}
            onClick={() => handleAddReaction(reaction.type)}
            disabled={loading}
            title={reaction.type}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>

      {reactions.length > 0 && (
        <div className="reactions-summary">
          {reactions.map(reaction => (
            <div key={reaction.type} className="reaction-badge">
              <span className="reaction-emoji">{reactionTypes.find(r => r.type === reaction.type)?.emoji}</span>
              <span className="reaction-count">{reaction.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionPicker;
