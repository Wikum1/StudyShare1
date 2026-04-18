import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Inbox,
  BookOpen,
  Command,
  Check,
  X,
  FileQuestion,
} from "lucide-react";
import "./AdminResources.css";

const getSubjectColors = (subject = "") => {
  if (subject.startsWith("CS")) {
    return {
      border: "subject-indigo-border",
      bg: "subject-indigo-bg",
      text: "subject-indigo-text",
      accent: "subject-indigo-accent",
    };
  }

  if (subject.startsWith("MATH")) {
    return {
      border: "subject-violet-border",
      bg: "subject-violet-bg",
      text: "subject-violet-text",
      accent: "subject-violet-accent",
    };
  }

  if (subject.startsWith("PHYS")) {
    return {
      border: "subject-cyan-border",
      bg: "subject-cyan-bg",
      text: "subject-cyan-text",
      accent: "subject-cyan-accent",
    };
  }

  if (subject.startsWith("PSY")) {
    return {
      border: "subject-rose-border",
      bg: "subject-rose-bg",
      text: "subject-rose-text",
      accent: "subject-rose-accent",
    };
  }

  return {
    border: "subject-slate-border",
    bg: "subject-slate-bg",
    text: "subject-slate-text",
    accent: "subject-slate-accent",
  };
};

const timeAgo = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return date.toLocaleDateString();
};

export default function AdminResources() {
  const token = localStorage.getItem("token");
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPendingResources = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/resources/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load resources");
        setResources([]);
        return;
      }

      if (Array.isArray(data)) {
        setResources(data);
      } else if (Array.isArray(data.resources)) {
        setResources(data.resources);
      } else if (Array.isArray(data.pendingResources)) {
        setResources(data.pendingResources);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while loading pending resources");
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPendingResources();
    } else {
      setMessage("No admin token found");
      setIsLoading(false);
    }
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/resources/approve/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Approve failed");
        return;
      }

      setResources((prev) => prev.filter((r) => r._id !== id));
      setMessage("Resource approved successfully");
    } catch (err) {
      console.error(err);
      setMessage("Server error while approving resource");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/resources/reject/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Reject failed");
        return;
      }

      setResources((prev) => prev.filter((r) => r._id !== id));
      setMessage("Resource rejected successfully");
    } catch (err) {
      console.error(err);
      setMessage("Server error while rejecting resource");
    }
  };

  const filtered = useMemo(() => {
    return resources.filter(
      (r) =>
        (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.subject || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const uniqueSubjectsCount = useMemo(() => {
    return new Set(resources.map((r) => r.subject).filter(Boolean)).size;
  }, [resources]);

  return (
    <div className="admin-resources-shell">
      <div className="admin-resources-header-band">
        <div className="admin-resources-header-inner">
          <div className="admin-resources-header-row">
            <div>
              <h1 className="admin-resources-title">Resource Management</h1>

              <div className="admin-resources-pills">
                <span className="admin-pill">
                  <Inbox size={14} />
                  {resources.length} pending
                </span>

                <span className="admin-pill">
                  <BookOpen size={14} />
                  {uniqueSubjectsCount} subjects
                </span>
              </div>
            </div>

            <div className="admin-search-wrap">
              <Search className="admin-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
              />
              <div className="admin-search-shortcut">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-resources-content">
        <div className="admin-resources-content-inner">
          {message && <div className="admin-resources-alert">{message}</div>}

          <div className="admin-resource-stack">
            {isLoading ? (
              <LoadingSkeletons />
            ) : filtered.length === 0 ? (
              <EmptyState search={search} />
            ) : (
              filtered.map((resource, index) => {
                const colors = getSubjectColors(resource.subject || "");
                const timestamp = timeAgo(resource.createdAt || resource.updatedAt);

                return (
                  <div
                    key={resource._id}
                    className="admin-resource-row"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`admin-resource-accent ${colors.accent}`}></div>

                    <div className="admin-resource-icon-wrap">
                      <FileText size={20} />
                    </div>

                    <div className="admin-resource-main">
                      <div className="admin-resource-head">
                        <h3 className="admin-resource-name">{resource.title}</h3>

                        <span
                          className={`admin-subject-tag ${colors.bg} ${colors.text}`}
                        >
                          {resource.subject || "General"}
                        </span>
                      </div>

                      <div className="admin-resource-meta">
                        <span className="admin-resource-time">
                          <Clock size={13} />
                          {timestamp}
                        </span>

                        <span className="admin-resource-status">
                          <span className="admin-resource-status-dot"></span>
                          Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="admin-resource-actions">
                      <button
                        type="button"
                        onClick={() => handleApprove(resource._id)}
                        className="icon-action-btn approve-action-btn"
                        title="Approve"
                      >
                        <CheckCircle2 size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(resource._id)}
                        className="icon-action-btn reject-action-btn"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="admin-resource-row loading-row">
          <div className="admin-resource-accent skeleton-accent"></div>

          <div className="admin-resource-icon-wrap skeleton-box"></div>

          <div className="admin-resource-main">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-sub"></div>
          </div>

          <div className="admin-resource-actions">
            <div className="skeleton-circle"></div>
            <div className="skeleton-circle"></div>
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ search }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon-wrap">
        <FileQuestion size={32} />
      </div>

      <h3>No resources found</h3>

      <p>
        {search
          ? `We couldn't find any resources matching "${search}". Try changing your search.`
          : "There are currently no pending resources to review."}
      </p>
    </div>
  );
}