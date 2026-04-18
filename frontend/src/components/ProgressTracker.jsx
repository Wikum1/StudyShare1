import React, { useEffect, useState } from "react";
import "./ProgressTracker.css";

function ProgressTracker({ planId, authToken }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    console.log("=== ProgressTracker Mount ===");
    console.log("planId:", planId);
    console.log("authToken exists:", !!authToken);

    if (!planId) {
      console.warn("⚠️ No planId provided to ProgressTracker");
      setLoading(false);
      setDebugInfo("No plan ID provided");
      return;
    }

    if (!authToken) {
      console.warn("⚠️ No auth token provided to ProgressTracker");
      setLoading(false);
      setError("Authentication token missing");
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const fetchUrl = `${apiUrl}/study-plans/${planId}/progress`;
        
        console.log("📡 Fetching from:", fetchUrl);

        const response = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📊 Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Error response:", response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Progress data received:", data);
        
        setProgressData(data);
        setError("");
        setDebugInfo("");
      } catch (err) {
        console.error("❌ Progress fetch error:", err);
        setError(`Failed: ${err.message}`);
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure component is mounted
    const timer = setTimeout(fetchProgress, 100);
    return () => clearTimeout(timer);

  }, [planId, authToken]);

  // Show loading state
  if (loading) {
    return (
      <div className="progress-container" style={{ 
        background: "#e8f4f8", 
        border: "2px solid #3498db",
        minHeight: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ 
          color: "#3498db", 
          fontSize: "16px",
          fontWeight: "600"
        }}>
          📊 Loading progress tracking...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="progress-container error" style={{ 
        background: "#ffe0e0", 
        border: "2px solid #e74c3c",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <div style={{ 
          color: "#c0392b", 
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "8px"
        }}>
          ⚠️ {error}
        </div>
        {debugInfo && (
          <div style={{ 
            color: "#c0392b", 
            fontSize: "12px",
            fontStyle: "italic"
          }}>
            {debugInfo}
          </div>
        )}
        <div style={{ 
          color: "#7f8c8d", 
          fontSize: "11px",
          marginTop: "8px"
        }}>
          💡 Check browser console (F12) for more details
        </div>
      </div>
    );
  }

  // Show no data state
  if (!progressData) {
    return (
      <div className="progress-container" style={{ 
        background: "#f0f0f0", 
        border: "2px dashed #bdc3c7",
        minHeight: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ 
          color: "#7f8c8d", 
          fontSize: "14px"
        }}>
          No progress data available yet
        </div>
      </div>
    );
  }

  const { stats, recommendations } = progressData;
  if (!stats) {
    return (
      <div className="progress-container error">
        <div style={{ color: "#c0392b", padding: "15px" }}>
          ❌ Invalid progress data received
        </div>
      </div>
    );
  }

  const {
    overallProgress,
    milestoneProgress,
    taskStats,
    daysUntilDue,
    isOnTrack,
  } = stats;

  return (
    <div className="progress-container">
      {/* Overall Progress Section */}
      <div className="progress-section main-progress">
        <div className="progress-header">
          <h3>📊 Overall Progress</h3>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(overallProgress, 5)}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-info">
          <div className="info-item">
            <span className="info-label">Tasks Completed:</span>
            <span className="info-value">
              {taskStats.completed} / {taskStats.total}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Pending:</span>
            <span className="info-value">{taskStats.pending}</span>
          </div>
          {daysUntilDue !== null && (
            <div className="info-item">
              <span className="info-label">Days Until Due:</span>
              <span className={`info-value ${daysUntilDue < 7 ? "urgent" : ""}`}>
                {daysUntilDue} days
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="status-badge">
          {isOnTrack === true && (
            <span className="status on-track">✓ On Track</span>
          )}
          {isOnTrack === false && (
            <span className="status behind">⚠ Behind Schedule</span>
          )}
          {isOnTrack === null && (
            <span className="status neutral">→ No Due Date Set</span>
          )}
        </div>
      </div>

      {/* Task Statistics by Priority */}
      {taskStats && (
        <div className="progress-section task-stats">
          <h4>📋 Tasks by Priority</h4>
          <div className="stats-grid">
            <div className="stat-card high-priority">
              <div className="stat-icon">🔴</div>
              <div className="stat-details">
                <div className="stat-label">High Priority</div>
                <div className="stat-count">
                  {taskStats.completedByPriority?.high || 0}/{taskStats.byPriority?.high || 0}
                </div>
              </div>
            </div>

            <div className="stat-card medium-priority">
              <div className="stat-icon">🟡</div>
              <div className="stat-details">
                <div className="stat-label">Medium Priority</div>
                <div className="stat-count">
                  {taskStats.completedByPriority?.medium || 0}/{taskStats.byPriority?.medium || 0}
                </div>
              </div>
            </div>

            <div className="stat-card low-priority">
              <div className="stat-icon">🟢</div>
              <div className="stat-details">
                <div className="stat-label">Low Priority</div>
                <div className="stat-count">
                  {taskStats.completedByPriority?.low || 0}/{taskStats.byPriority?.low || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {stats.milestones && stats.milestones.length > 0 && (
        <div className="progress-section milestones">
          <div className="milestone-header">
            <h4>🎯 Milestones ({milestoneProgress}%)</h4>
            <div className="milestone-progress-bar">
              <div
                className="milestone-progress-fill"
                style={{ width: `${milestoneProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="milestones-list">
            {stats.milestones.map((milestone, idx) => (
              <div
                key={idx}
                className={`milestone-item ${
                  milestone.completed ? "completed" : ""
                } ${milestone.isOverdue ? "overdue" : ""}`}
              >
                <div className="milestone-checkbox">
                  {milestone.completed ? "✓" : "○"}
                </div>
                <div className="milestone-info">
                  <div className="milestone-title">{milestone.title}</div>
                  {milestone.description && (
                    <div className="milestone-description">
                      {milestone.description}
                    </div>
                  )}
                  <div className="milestone-date">
                    📅 {new Date(milestone.targetDate).toLocaleDateString()}
                    {milestone.completed && milestone.completedDate && (
                      <span className="completed-date">
                        ✓ Completed:{" "}
                        {new Date(milestone.completedDate).toLocaleDateString()}
                      </span>
                    )}
                    {milestone.isOverdue && !milestone.completed && (
                      <span className="overdue-tag">OVERDUE</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="progress-section recommendations">
          <h4>💡 Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProgressTracker;
