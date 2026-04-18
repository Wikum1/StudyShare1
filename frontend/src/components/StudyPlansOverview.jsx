import React, { useEffect, useState } from "react";
import { getPlans } from "../services/studyPlanService";
import "./StudyPlansOverview.css";

function StudyPlansOverview() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching plans from API...");
      
      const response = await getPlans();
      console.log("Full API Response:", response);
      
      // Handle different response structures
      let plansData = [];
      if (Array.isArray(response)) {
        // Response is already an array
        plansData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response has .data property with array
        plansData = response.data;
      } else if (response && Array.isArray(response)) {
        // Response is array directly
        plansData = response;
      }
      
      console.log("Extracted plans data:", plansData);
      console.log("Number of plans:", plansData.length);
      
      setPlans(plansData);
    } catch (error) {
      console.error("Error fetching plans:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || "Failed to fetch plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPlans();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Listen for task update events
  useEffect(() => {
    window.addEventListener("taskUpdated", fetchPlans);
    return () => window.removeEventListener("taskUpdated", fetchPlans);
  }, []);

  if (loading && plans.length === 0) {
    return (
      <div className="study-plans-overview">
        <div className="loading">Loading study plans...</div>
      </div>
    );
  }

  return (
    <div className="study-plans-overview">
      <div className="overview-header">
        <h3>📚 Study Plans Progress</h3>
        {plans.length > 0 && (
          <div className="plan-count-badge">
            {plans.length} Plan{plans.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {loading && plans.length === 0 ? (
        <div className="loading">Loading study plans...</div>
      ) : error && plans.length === 0 ? (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Error loading plans: {error}</p>
          <button className="retry-btn" onClick={fetchPlans}>
            Try Again
          </button>
        </div>
      ) : plans.length > 0 ? (
        <div className="plans-list">
          {plans.map((plan) => {
            const completedTasks = plan.tasks?.filter(
              (t) => t.status === "completed"
            ).length || 0;
            const totalTasks = plan.tasks?.length || 0;
            const progress =
              totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div key={plan._id} className="plan-card">
                <div className="plan-info">
                  <h4 className="plan-title">{plan.title}</h4>
                  <p className="plan-subject">
                    {plan.subject} {plan.subjectCode && `(${plan.subjectCode})`}
                  </p>
                </div>

                <div className="progress-info">
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="progress-percentage">{progress}%</span>
                </div>

                <div className="task-count">
                  {completedTasks} / {totalTasks} tasks
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No study plans created yet</p>
          <a href="/study-planner" className="create-plan-btn">
            Create Your First Plan
          </a>
        </div>
      )}
    </div>
  );
}

export default StudyPlansOverview;

