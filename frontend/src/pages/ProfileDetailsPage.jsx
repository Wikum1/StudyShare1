import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ProfileDetailsPage.css";

const PREDEFINED_INTERESTS = {
  "Programming": "💻",
  "Business": "💼",
  "Design": "🎨",
  "Science": "🔬",
  "Fitness": "💪",
  "Music": "🎵",
  "Sports": "⚽",
  "Gaming": "🎮"
};

export default function ProfileDetailsPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseProgress, setCourseProgress] = useState({
    activeStudyPlans: 0,
    resourcesUploaded: 0,
    postsCreated: 0,
    courseCompletionPercent: 0
  });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    phoneNumber: "",
    interests: []
  });
  const [studyStats, setStudyStats] = useState({
    activeHours: 0,
    tasksDone: 0,
    taskCompletionRate: 0,
    studyStreak: 0
  });
  const [learningGoals, setLearningGoals] = useState([]);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      // Use studentId from URL params, or fallback to logged-in user
      const idToFetch = studentId || loggedInUser?.id;

      if (!token || !idToFetch) {
        navigate("/login");
        return;
      }

      console.log("📊 Fetching data for studentId:", idToFetch);
      console.log("URL studentId param:", studentId);
      console.log("Logged in user id:", loggedInUser?.id);

      // Fetch all data in parallel
      const [studentRes, studyPlansRes, resourcesRes, postsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/${idToFetch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/study-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { plans: [] } })),
        axios.get(`${API_URL}/api/resources/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { resources: [] } })),
        axios.get(`${API_URL}/api/posts/user/${idToFetch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { posts: [] } }))
      ]);

      setStudent(studentRes.data.user);
      
      // Process study plans
      const plans = studyPlansRes.data.plans || studyPlansRes.data || [];
      
      // Process resources
      const resData = resourcesRes.data.resources || resourcesRes.data || [];
      
      // Process posts
      const postsData = postsRes.data.posts || postsRes.data || [];
      console.log("Posts API Response:", postsRes.data);
      console.log("Extracted posts data:", postsData);
      console.log("Posts count:", postsData.length);

      // Calculate stats
      const activeStudyPlanCount = plans.filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate > new Date();
      }).length;

      const resourceCount = resData.length;
      const postCount = postsData.length;

      // Calculate course completion percentage based on active studies
      const completionPercent = activeStudyPlanCount > 0 ? Math.min(100, (activeStudyPlanCount * 20)) : 0;

      setCourseProgress({
        activeStudyPlans: activeStudyPlanCount,
        resourcesUploaded: resourceCount,
        postsCreated: postCount,
        courseCompletionPercent: completionPercent
      });

      // Calculate study statistics

      // For active hours: calculate from plans updated in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activePlans = plans.filter(p => new Date(p.updatedAt || p.createdAt) > sevenDaysAgo);
      const activeHours = activePlans.reduce((sum, plan) => sum + (plan.hoursAllocated || 0), 0);

      // Count tasks marked as done
      const tasksDone = plans.filter(p => p.status === "completed" || p.completed === true).length;
      
      // Task completion rate
      const taskCompletionRate = plans.length > 0 ? Math.round((tasksDone / plans.length) * 100) : 0;

      setStudyStats({
        activeHours: activeHours,
        tasksDone: tasksDone,
        taskCompletionRate: taskCompletionRate,
        studyStreak: Math.floor(Math.random() * 15) + 3 // Mock data: 3-17 day streak
      });

      // Transform study plans into learning goals with progress tracking
      const goals = plans.map((plan, idx) => {
        const isCompleted = plan.status === "completed" || plan.completed === true;
        const dueDate = new Date(plan.dueDate);
        const today = new Date();
        const totalDays = (dueDate - plan.createdAt) / (1000 * 60 * 60 * 24);
        const daysSpent = (today - plan.createdAt) / (1000 * 60 * 60 * 24);
        const progress = isCompleted ? 100 : Math.min(100, Math.round((daysSpent / totalDays) * 100));
        
        // Determine completion level
        let completionLevel = "Not Started";
        if (progress < 25) completionLevel = "Just Started";
        else if (progress < 50) completionLevel = "In Progress";
        else if (progress < 75) completionLevel = "Nearly Done";
        else if (progress < 100) completionLevel = "Almost Complete";
        else completionLevel = "Completed";

        return {
          id: plan._id || idx,
          title: plan.topic || plan.title || "Untitled Study Plan",
          subject: plan.subject || "General",
          progress: progress,
          dueDate: dueDate.toLocaleDateString("en-US", { year: "2-digit", month: "short" }),
          hoursAllocated: plan.hoursAllocated || 0,
          status: plan.status || "in-progress",
          completionLevel: completionLevel,
          isCompleted: isCompleted
        };
      });

      setLearningGoals(goals);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      setError("Failed to load student details");
    } finally {
      setLoading(false);
    }
  }, [loggedInUser?.id, studentId, token, navigate]);

  useEffect(() => {
    fetchStudentData();
  }, [studentId, navigate, fetchStudentData]);

  const handleEditProfile = () => {
    // Only allow edit if viewing own profile
    if (loggedInUser?.id === (studentId || loggedInUser?.id)) {
      const interestsArray = student?.interests 
        ? (Array.isArray(student.interests) ? student.interests : [student.interests])
        : [];
      setEditFormData({
        name: student?.name || "",
        email: student?.email || "",
        bio: student?.bio || "",
        location: student?.location || "",
        phoneNumber: student?.phoneNumber || "",
        interests: interestsArray
      });
      setEditModalOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/users/profile/edit`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update student object with new data
      setStudent(response.data.user);

      // Update localStorage user if it's the current user
      if (loggedInUser?.id === response.data.user?.id) {
        const updatedUser = { ...loggedInUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setEditModalOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleAvatarClick = () => {
    // Only allow upload if viewing own profile
    if (loggedInUser?.id === (studentId || loggedInUser?.id)) {
      fileInputRef.current?.click();
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        `${API_URL}/api/users/profile/upload-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update student object with new avatar
      setStudent(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));

      // Update localStorage user if it's the current user
      if (loggedInUser?.id === response.data.user?.id) {
        const updatedUser = { ...loggedInUser, avatar: response.data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = () => {
    if (!student?.name) return "?";
    return student.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="student-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-details-page">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="student-details-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/students")} className="breadcrumb-link">Student</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Student Details</span>
        </div>

        {/* Page Title */}
        <h1 className="page-title">Student Details</h1>

        {/* Student Card */}
        <div className="student-card">
          <div className="student-card-left">
            <div 
              className={`student-avatar ${loggedInUser?.id === (studentId || loggedInUser?.id) ? "clickable" : ""}`}
              onClick={handleAvatarClick}
              style={{
                opacity: uploadingPicture ? 0.7 : 1,
                transition: "opacity 0.3s"
              }}
              title={loggedInUser?.id === (studentId || loggedInUser?.id) ? "Click to change profile picture" : ""}
            >
              {student?.avatar ? (
                <img src={student.avatar} alt={student.name} />
              ) : (
                <div className="avatar-initials">{getInitials()}</div>
              )}
              {uploadingPicture && <div className="avatar-uploading">Uploading...</div>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              style={{ display: "none" }}
              disabled={uploadingPicture}
            />
            
            <div className="student-info">
              <h2 className="student-name">{student?.name}</h2>
              <p className="student-email">✉️ {student?.email}</p>
              {student?.bio && (
                <p className="student-bio">{student.bio}</p>
              )}
              {student?.interests && (
                <div className="student-interests">
                  {Array.isArray(student.interests) 
                    ? student.interests.map((interest, idx) => (
                        <span key={idx} className="interest-tag">
                          {PREDEFINED_INTERESTS[interest] || "📌"} {interest}
                        </span>
                      ))
                    : <span className="interest-tag">{PREDEFINED_INTERESTS[student.interests] || "📌"} {student.interests}</span>
                  }
                </div>
              )}
              <div className="student-status">
                <span className="status-indicator active"></span>
                <span className="status-text">Active - active about 2 hours ago</span>
              </div>
              {loggedInUser?.id === (studentId || loggedInUser?.id) && (
                <button className="btn-edit-profile" onClick={handleEditProfile}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="student-card-right">
            {/* Progress Circle */}
            <div className="progress-section">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100" className="progress-svg">
                  <circle cx="50" cy="50" r="45" className="progress-bg" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    className="progress-fill" 
                    style={{
                      strokeDasharray: `${(courseProgress.courseCompletionPercent / 100) * 282.7} 282.7`
                    }}
                  />
                </svg>
                <div className="progress-text">
                  <span className="progress-number">{Math.round(courseProgress.courseCompletionPercent)}%</span>
                  <span className="progress-label">Activity Level</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-label">Active Study Plans</span>
                <span className="stat-value">{courseProgress.activeStudyPlans}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Resources</span>
                <span className="stat-value">{courseProgress.resourcesUploaded}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Posts</span>
                <span className="stat-value">{courseProgress.postsCreated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Statistics Section */}
        <div className="study-stats-section">
          <h2 className="section-title">📊 Study Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">⏱️</div>
              <div className="stat-card-content">
                <span className="stat-card-value">{studyStats.activeHours}</span>
                <span className="stat-card-label">Active Hours</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-content">
                <span className="stat-card-value">{studyStats.tasksDone}</span>
                <span className="stat-card-label">Tasks Done</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📈</div>
              <div className="stat-card-content">
                <span className="stat-card-value">{studyStats.taskCompletionRate}%</span>
                <span className="stat-card-label">Completion Rate</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">🔥</div>
              <div className="stat-card-content">
                <span className="stat-card-value">{studyStats.studyStreak}</span>
                <span className="stat-card-label">Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Goals Section */}
        <div className="learning-goals-section">
          <h2 className="section-title">🎯 Task Progress Tracker</h2>
          {learningGoals.length === 0 ? (
            <p className="no-goals-message">No study plans yet. Create one to get started!</p>
          ) : (
            <div className="goals-container">
              {learningGoals.map((goal) => (
                <div key={goal.id} className={`goal-card ${goal.isCompleted ? "completed" : ""}`}>
                  <div className="goal-header">
                    <div className="goal-title-section">
                      <h3 className="goal-title">{goal.title}</h3>
                      <span className="goal-subject">{goal.subject}</span>
                    </div>
                    <div className="goal-badges">
                      <span className={`completion-badge level-${goal.completionLevel.replace(/\s+/g, '-').toLowerCase()}`}>
                        {goal.completionLevel}
                      </span>
                      <span className={`status-badge ${goal.status}`}>
                        {goal.status === "completed" || goal.isCompleted ? "✓ Done" : "In Progress"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="goal-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Due:</span>
                      <span className="detail-value">{goal.dueDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Hours:</span>
                      <span className="detail-value">{goal.hoursAllocated}h</span>
                    </div>
                  </div>

                  <div className="goal-progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-percentage">{goal.progress}%</span>
                    </div>
                    <div className="goal-progress-bar">
                      <div 
                        className="goal-progress-fill" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {editModalOpen && (
          <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Edit Profile</h2>
                <button className="modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    placeholder="Enter bio"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interests (Select Multiple)</label>
                  <div className="interests-checkbox-group">
                    {Object.entries(PREDEFINED_INTERESTS).map(([interest, emoji]) => (
                      <label key={interest} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editFormData.interests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditFormData({
                                ...editFormData,
                                interests: [...editFormData.interests, interest]
                              });
                            } else {
                              setEditFormData({
                                ...editFormData,
                                interests: editFormData.interests.filter(i => i !== interest)
                              });
                            }
                          }}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">{emoji} {interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

