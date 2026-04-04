import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../utils/authStorage";
import { apiUrl } from "../config/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromPath = location.pathname.endsWith("/resources")
    ? "resources"
    : "students";

  const [activeTab, setActiveTab] = useState(tabFromPath);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(() => {
    const u = getStoredUser();
    return String(u?.role || "").toLowerCase().trim() === "admin";
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    year: "",
    modulesText: "",
  });

  /** "grid" = show all created profiles at once; "single" = browse one by one. */
  const [studentBrowseMode, setStudentBrowseMode] = useState("grid");
  const [studentIndex, setStudentIndex] = useState(0);

  const user = getStoredUser();
  const token = getAuthToken();
  const isAdmin = String(user?.role || "").toLowerCase().trim() === "admin";

  useEffect(() => {
    setActiveTab(tabFromPath);
  }, [tabFromPath]);

  useEffect(() => {
    setStudentIndex((i) => {
      if (students.length === 0) return 0;
      return Math.min(Math.max(0, i), students.length - 1);
    });
  }, [students.length]);

  const fetchPendingResources = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(apiUrl("/api/admin/resources/pending"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load pending resources");
        return;
      }

      setResources(data);
    } catch (err) {
      setMessage("Server error while fetching resources");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStudents = useCallback(async () => {
    if (!token) {
      setStudents([]);
      setStudentsLoading(false);
      return;
    }
    try {
      setStudentsLoading(true);
      setMessage("");

      const res = await fetch(apiUrl("/api/admin/users/students"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        setMessage("Invalid response from server when loading students.");
        return;
      }

      if (!res.ok) {
        setMessage(
          data?.message ||
            data?.detail ||
            `Failed to load students (${res.status})`
        );
        return;
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(
        err?.message?.includes("Failed to fetch")
          ? "Cannot reach API. Start the backend and use Refresh, or check your network."
          : "Server error while fetching students"
      );
    } finally {
      setStudentsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }

    fetchPendingResources();
    fetchStudents();
  }, [isAdmin, navigate, fetchPendingResources, fetchStudents]);

  // When the admin switches back to this browser tab, reload the student list so
  // sign-ups done in another tab show up without only using manual Refresh.
  useEffect(() => {
    if (!isAdmin || activeTab !== "students") return;

    const onVisible = () => {
      if (document.visibilityState === "visible") fetchStudents();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAdmin, activeTab, fetchStudents]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/resources/${id}/approve`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Approve failed");
        return;
      }

      setResources((prev) => prev.filter((item) => item._id !== id));
      setMessage("Resource approved successfully");
    } catch (err) {
      setMessage("Server error while approving resource");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/resources/${id}/reject`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Reject failed");
        return;
      }

      setResources((prev) => prev.filter((item) => item._id !== id));
      setMessage("Resource rejected successfully");
    } catch (err) {
      setMessage("Server error while rejecting resource");
    }
  };

  const startEdit = (s) => {
    const sid = s.id || s._id;
    setEditingId(sid);
    setEditForm({
      name: s.name || "",
      email: s.email || "",
      password: "",
      university: s.university || "",
      year: s.year === null || s.year === undefined ? "" : String(s.year),
      modulesText: (s.modules || []).join(", "),
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      email: "",
      password: "",
      university: "",
      year: "",
      modulesText: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveStudent = async (studentId) => {
    try {
      const modules = editForm.modulesText
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      const body = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        university: editForm.university.trim(),
        year: editForm.year === "" ? null : Number(editForm.year),
        modules,
      };

      if (editForm.password.trim()) {
        body.password = editForm.password.trim();
      }

      const res = await fetch(apiUrl(`/api/admin/users/students/${studentId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Update failed");
        return;
      }

      setStudents((prev) =>
        prev.map((x) => {
          const id = x.id || x._id;
          return String(id) === String(studentId) ? data.user : x;
        })
      );
      setMessage("Student profile updated");
      cancelEdit();
    } catch (err) {
      setMessage("Server error while updating student");
    }
  };

  const deleteStudent = async (studentId) => {
    if (
      !window.confirm(
        "Remove this student account? Their notifications will be deleted and uploads will be unlinked."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/admin/users/students/${studentId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setStudents((prev) =>
        prev.filter((x) => String(x.id || x._id) !== String(studentId))
      );
      if (editingId && String(editingId) === String(studentId)) {
        cancelEdit();
      }
      setMessage("Student removed");
    } catch (err) {
      setMessage("Server error while removing student");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRefreshStudents = () => {
    setMessage("");
    fetchStudents();
  };

  const studentsToShow =
    studentBrowseMode === "single" && students.length > 0
      ? [students[studentIndex]]
      : students;

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              {activeTab === "resources"
                ? "Review uploaded resources and approve or reject them."
                : "See every registered student account and open each profile (name, email, university, year, modules)."}
            </p>
          </div>

          <button className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            className={`admin-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => {
              navigate("/admin-dashboard/students");
              setMessage("");
              fetchStudents();
            }}
            role="tab"
            aria-selected={activeTab === "students"}
          >
            Registered accounts
            {!studentsLoading && (
              <span className="admin-tab-count" aria-live="polite">
                ({students.length})
              </span>
            )}
            {studentsLoading && (
              <span className="admin-tab-count admin-tab-count--loading">
                …
              </span>
            )}
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => {
              navigate("/admin-dashboard/resources");
              setMessage("");
            }}
            role="tab"
            aria-selected={activeTab === "resources"}
          >
            Pending resources
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {activeTab === "resources" && (
          <section className="admin-dashboard-section" aria-labelledby="admin-resources-heading">
            <h2 id="admin-resources-heading" className="admin-dashboard-section-title">
              Pending resource uploads
            </h2>
            <p className="admin-dashboard-section-hint">
              Approve or reject files submitted by students before they appear on the site.
            </p>
            {loading ? (
              <p className="admin-loading">Loading pending resources...</p>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                <h3>No pending resources</h3>
                <p>All uploaded resources have been reviewed.</p>
              </div>
            ) : (
              <div className="admin-resource-grid">
                {resources.map((resource) => (
                  <div className="admin-resource-card" key={resource._id}>
                    <div className="card-top">
                      <h3>{resource.title}</h3>
                      <p className="subject">Subject: {resource.subject}</p>
                      <p className="description">{resource.description}</p>
                      <span className="pending-badge">{resource.status}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        onClick={() => handleApprove(resource._id)}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        className="reject-btn"
                        onClick={() => handleReject(resource._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "students" && (
          <section className="admin-dashboard-section" aria-labelledby="admin-students-heading">
            <h2 id="admin-students-heading" className="admin-dashboard-section-title">
              Profile view — registered accounts
              {!studentsLoading && (
                <span className="admin-dashboard-count-pill">
                  {students.length} account{students.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
            <p className="admin-dashboard-section-hint">
              These are the same users who signed up on <strong>Register</strong> (student
              role). Each card is their profile as stored in the database. Admin logins
              are not listed. Use <strong>Refresh student list</strong> after new
              registrations.
            </p>

            {!studentsLoading && students.length > 0 && (
              <p className="admin-student-loaded-banner" role="status">
                Showing <strong>{students.length}</strong> student profile
                {students.length !== 1 ? "s" : ""} already created — details below
                match what each student saved when they registered or edited their
                profile.
              </p>
            )}

            <div className="admin-student-toolbar">
              <button
                type="button"
                className="admin-refresh-students"
                onClick={handleRefreshStudents}
                disabled={studentsLoading || !token}
              >
                {studentsLoading ? "Loading…" : "Refresh student list"}
              </button>
              <div className="admin-student-view-toggle" role="group" aria-label="Student list layout">
                <button
                  type="button"
                  className={
                    studentBrowseMode === "single"
                      ? "admin-view-mode active"
                      : "admin-view-mode"
                  }
                  onClick={() => setStudentBrowseMode("single")}
                >
                  One by one
                </button>
                <button
                  type="button"
                  className={
                    studentBrowseMode === "grid"
                      ? "admin-view-mode active"
                      : "admin-view-mode"
                  }
                  onClick={() => setStudentBrowseMode("grid")}
                >
                  All cards
                </button>
              </div>
            </div>

            {studentBrowseMode === "single" &&
              students.length > 1 &&
              !studentsLoading && (
                <div className="admin-student-single-controls">
                  <button
                    type="button"
                    className="admin-student-nav-btn"
                    disabled={studentIndex <= 0}
                    onClick={() =>
                      setStudentIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    ← Previous
                  </button>
                  <div className="admin-student-counter">
                    <span className="admin-student-counter-badge">
                      Student {studentIndex + 1} of {students.length}
                    </span>
                    <label className="admin-student-jump-label">
                      <span className="visually-hidden">Jump to student</span>
                      <select
                        className="admin-student-jump-select"
                        value={studentIndex}
                        onChange={(e) =>
                          setStudentIndex(Number(e.target.value))
                        }
                      >
                        {students.map((st, idx) => (
                          <option
                            key={String(st.id || st._id)}
                            value={idx}
                          >
                            {(st.name || "Student").slice(0, 40)}
                            {st.email ? ` — ${st.email}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="admin-student-nav-btn"
                    disabled={studentIndex >= students.length - 1}
                    onClick={() =>
                      setStudentIndex((i) =>
                        Math.min(students.length - 1, i + 1)
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              )}

          {studentsLoading ? (

            <p className="admin-loading">Loading student profiles...</p>

          ) : students.length === 0 ? (

            <div className="empty-state">

              {!token ? (
                <>
                  <h3>Session incomplete</h3>
                  <p>
                    Sign out and log in again as admin so student profiles can load.
                  </p>
                </>
              ) : (
                <>
                  <h3>No student profiles to show yet</h3>
                  <p>
                    When a student creates an account on the{" "}
                    <strong>Register</strong> page, their profile appears here
                    automatically. Click <strong>Refresh student list</strong> after
                    someone signs up.
                  </p>
                </>
              )}

            </div>

          ) : (
            <>
              <p className="admin-student-section-intro">
                <strong>{students.length}</strong> registered account
                {students.length !== 1 ? "s" : ""} in this view.{" "}
                {studentBrowseMode === "single"
                  ? "One profile at a time — use Previous / Next or the dropdown."
                  : "All profiles are shown in the grid below."}{" "}
                Use <strong>Edit profile</strong> or <strong>Remove student</strong> as
                needed.
              </p>
              <div
                className={`admin-student-grid${
                  studentBrowseMode === "single"
                    ? " admin-student-grid--single"
                    : ""
                }`}
              >
              {studentsToShow.map((s) => {

                const sid = s.id || s._id;

                const isEditing = editingId && String(editingId) === String(sid);



                return (

                  <div
                    className={`admin-student-card${isEditing ? " admin-student-card--editing" : ""}`}
                    key={sid}
                  >

                    {!isEditing ? (

                      <>

                        <div className="admin-student-name-box" aria-label="Student name">
                          <span className="admin-student-avatar" aria-hidden="true">
                            {(s.name || "?").trim().charAt(0).toUpperCase()}
                          </span>
                          <h3 className="admin-student-name">{s.name || "—"}</h3>
                        </div>

                        <div className="admin-student-details-box">
                          <p className="admin-student-details-heading">Details</p>
                          <dl className="admin-student-dl">

                            <div className="admin-student-row">
                              <dt>Email</dt>
                              <dd>{s.email || "—"}</dd>
                            </div>

                            <div className="admin-student-row">
                              <dt>University</dt>
                              <dd>{s.university?.trim() ? s.university : "—"}</dd>
                            </div>

                            <div className="admin-student-row">
                              <dt>Year</dt>
                              <dd>
                                {s.year === null || s.year === undefined
                                  ? "—"
                                  : s.year}
                              </dd>
                            </div>

                            <div className="admin-student-row">
                              <dt>Modules</dt>
                              <dd>
                                {(s.modules || []).length > 0
                                  ? s.modules.join(", ")
                                  : "—"}
                              </dd>
                            </div>

                            <div className="admin-student-row admin-student-row--meta">
                              <dt>Joined</dt>
                              <dd>
                                {s.createdAt
                                  ? new Date(s.createdAt).toLocaleDateString()
                                  : "—"}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="admin-student-actions">

                          <button

                            type="button"

                            className="admin-student-edit"

                            onClick={() => startEdit(s)}

                          >

                            Edit profile

                          </button>

                          <button

                            type="button"

                            className="admin-student-delete"

                            onClick={() => deleteStudent(sid)}

                          >

                            Remove student

                          </button>

                        </div>

                      </>

                    ) : (

                      <div className="admin-student-edit-form">

                        <label className="admin-student-label">

                          Name

                          <input

                            name="name"

                            value={editForm.name}

                            onChange={handleEditChange}

                            className="admin-student-input"

                          />

                        </label>

                        <label className="admin-student-label">

                          Email

                          <input

                            name="email"

                            type="email"

                            value={editForm.email}

                            onChange={handleEditChange}

                            className="admin-student-input"

                          />

                        </label>

                        <label className="admin-student-label">

                          New password (optional)

                          <input

                            name="password"

                            type="password"

                            value={editForm.password}

                            onChange={handleEditChange}

                            placeholder="Leave blank to keep current"

                            className="admin-student-input"

                          />

                        </label>

                        <label className="admin-student-label">

                          University

                          <input

                            name="university"

                            value={editForm.university}

                            onChange={handleEditChange}

                            className="admin-student-input"

                          />

                        </label>

                        <label className="admin-student-label">

                          Year

                          <input

                            name="year"

                            type="number"

                            min={1}

                            max={10}

                            value={editForm.year}

                            onChange={handleEditChange}

                            className="admin-student-input"

                          />

                        </label>

                        <label className="admin-student-label">

                          Modules (comma separated)

                          <textarea

                            name="modulesText"

                            value={editForm.modulesText}

                            onChange={handleEditChange}

                            rows={3}

                            className="admin-student-textarea"

                          />

                        </label>

                        <div className="admin-student-form-actions">

                          <button

                            type="button"

                            className="admin-student-save"

                            onClick={() => saveStudent(sid)}

                          >

                            Save changes

                          </button>

                          <button

                            type="button"

                            className="admin-student-cancel"

                            onClick={cancelEdit}

                          >

                            Cancel

                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>
            </>
          )}
          </section>
        )}

      </div>

    </div>

  );

}

