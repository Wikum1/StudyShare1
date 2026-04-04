import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import resourceService from "../services/resource.service";
import "./MyResources.css";

export default function MyResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const location = useLocation();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await resourceService.getMyResources();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Scroll to resource when navigated from notification
  useEffect(() => {
    if (location.state?.resourceId) {
      setTimeout(() => {
        const resourceElement = document.getElementById(`resource-${location.state.resourceId}`);
        if (resourceElement) {
          resourceElement.scrollIntoView({ behavior: "smooth", block: "center" });
          resourceElement.classList.add("highlight-resource");
          setTimeout(() => {
            resourceElement.classList.remove("highlight-resource");
          }, 3000);
        }
      }, 300);
    }
  }, [location.state]);

  const getFileUrl = (path) => {
    if (!path) return "#";
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  const getFileType = (fileUrl) => {
    if (!fileUrl) return "other";

    const ext = fileUrl.split(".").pop().toLowerCase();

    if (ext === "pdf" || ext === "doc" || ext === "docx") return "document";
    if (["mp4", "mov", "mkv", "avi"].includes(ext)) return "video";

    return "other";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "document":
        return "📄";
      case "video":
        return "▶";
      default:
        return "📁";
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(Number(bytes))) return "Unknown size";
    const size = Number(bytes);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(
      1
    )} MB`;

    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const searchLower = searchQuery.toLowerCase();

      const fileName =
        resource.fileUrl?.split("\\").pop()?.split("/").pop() || "";

      const matchesSearch =
        (resource.title || "").toLowerCase().includes(searchLower) ||
        (resource.subject || "").toLowerCase().includes(searchLower) ||
        fileName.toLowerCase().includes(searchLower);

      const type = getFileType(resource.fileUrl);
      const status = (resource.status || "").toLowerCase();

      let matchesFilter = true;

      switch (activeFilter) {
        case "Videos":
          matchesFilter = type === "video";
          break;
        case "Documents":
          matchesFilter = type === "document";
          break;
        case "Pending":
          matchesFilter = status === "pending";
          break;
        case "Approved":
          matchesFilter = status === "approved";
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const totalFiles = resources.length;
    const pendingCount = resources.filter(
      (r) => (r.status || "").toLowerCase() === "pending"
    ).length;
    const approvedCount = resources.filter(
      (r) => (r.status || "").toLowerCase() === "approved"
    ).length;
    const videoCount = resources.filter(
      (r) => getFileType(r.fileUrl) === "video"
    ).length;

    return { totalFiles, pendingCount, approvedCount, videoCount };
  }, [resources]);

  const filters = [
    { label: "All", icon: "🗂" },
    { label: "Videos", icon: "🎥" },
    { label: "Documents", icon: "📄" },
    { label: "Pending", icon: "⏳" },
    { label: "Approved", icon: "✅" },
  ];

  return (
    <div className="my-resources-page">
      <div className="my-resources-wrapper">
        <div className="myr-page-header">
          <div>
            <p className="myr-breadcrumb">Dashboard / My Uploaded Resources</p>
            <h1 className="myr-title">Resource Overview</h1>
            <p className="myr-subtitle">
              Manage, view, and organize your uploaded files with a cleaner,
              smarter dashboard experience.
            </p>
          </div>

          <a href="/dashboard/upload" className="myr-upload-btn">
            <span>⬆</span>
            Upload File
          </a>
        </div>

        <div className="myr-stats-grid">
          <div className="myr-stat-card indigo">
            <div className="myr-stat-leftbar" />
            <div className="myr-stat-content">
              <div>
                <p className="myr-stat-label">Total Files</p>
                <div className="myr-stat-value-row">
                  <h3>{stats.totalFiles}</h3>
                  <span>/ {stats.totalFiles}</span>
                </div>
              </div>
              <div className="myr-stat-circle indigo-circle">
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="myr-stat-card amber">
            <div className="myr-stat-leftbar" />
            <div className="myr-stat-content">
              <div>
                <p className="myr-stat-label">Pending Review</p>
                <div className="myr-stat-value-row">
                  <h3>{stats.pendingCount}</h3>
                  <span>/ {stats.totalFiles}</span>
                </div>
              </div>
              <div className="myr-stat-circle amber-circle">
                <span>
                  {stats.totalFiles
                    ? Math.round((stats.pendingCount / stats.totalFiles) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="myr-stat-card teal">
            <div className="myr-stat-leftbar" />
            <div className="myr-stat-content">
              <div>
                <p className="myr-stat-label">Approved</p>
                <div className="myr-stat-value-row">
                  <h3>{stats.approvedCount}</h3>
                  <span>/ {stats.totalFiles}</span>
                </div>
              </div>
              <div className="myr-stat-circle teal-circle">
                <span>
                  {stats.totalFiles
                    ? Math.round((stats.approvedCount / stats.totalFiles) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="myr-stat-card violet">
            <div className="myr-stat-leftbar" />
            <div className="myr-stat-content">
              <div>
                <p className="myr-stat-label">Videos</p>
                <div className="myr-stat-value-row">
                  <h3>{stats.videoCount}</h3>
                  <span>/ {stats.totalFiles}</span>
                </div>
              </div>
              <div className="myr-stat-circle violet-circle">
                <span>
                  {stats.totalFiles
                    ? Math.round((stats.videoCount / stats.totalFiles) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="myr-top-controls">
          <div className="myr-search-wrap">
            <span className="myr-search-icon">🔎</span>
            <input
              type="text"
              placeholder="Search files, subjects, or filenames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="myr-filter-row">
          <div className="myr-filter-group">
            {filters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={`myr-filter-btn ${
                  activeFilter === filter.label ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.label)}
              >
                <span>{filter.icon}</span>
                {filter.label === "All" ? "All Files" : filter.label}
              </button>
            ))}
          </div>

          <div className="myr-view-toggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              ⬚
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>

        {loading && <p className="myr-info-text">Loading resources...</p>}

        {!loading && filteredResources.length === 0 && (
          <div className="myr-empty-box">
            <div className="myr-empty-icon">🔍</div>
            <h3>No resources found</h3>
            <p>
              We couldn&apos;t find any files matching your current search and
              filters.
            </p>
            <button
              type="button"
              className="myr-clear-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && filteredResources.length > 0 && viewMode === "grid" && (
          <div className="myr-grid">
            {filteredResources.map((r) => {
              const fileType = getFileType(r.fileUrl);
              const fileName =
                r.fileUrl?.split("\\").pop()?.split("/").pop() ||
                "Unknown file";
              const fileDate = formatDate(r.createdAt || r.updatedAt);
              const fileSize = formatFileSize(r.fileSize || r.size);
              const status = (r.status || "pending").toLowerCase();

              return (
                <div className="myr-card" key={r._id}>
                <div id={`resource-${r._id}`} className="resource-card" key={r._id}>
                  <div
                    className={`myr-preview ${
                      fileType === "video" ? "video-preview" : "doc-preview"
                    }`}
                  >
                    <div className="myr-preview-status">
                      <span
                        className={`status-dot ${
                          status === "approved" ? "approved-dot" : "pending-dot"
                        }`}
                      />
                      {status}
                    </div>

                    <div className="myr-preview-icon">
                      {getFileIcon(fileType)}
                    </div>

                    <div className="myr-preview-overlay">
                      <a
                        href={getFileUrl(r.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="myr-overlay-btn"
                        title="View"
                      >
                        👁
                      </a>
                      <a
                        href={getFileUrl(r.fileUrl)}
                        download
                        className="myr-overlay-btn"
                        title="Download"
                      >
                        ⬇
                      </a>
                      <button
                        type="button"
                        className="myr-overlay-btn"
                        title="Share"
                      >
                        ↗
                      </button>
                    </div>
                  </div>

                  <div className="myr-card-content">
                    <div className="myr-card-title-row">
                      <h4 title={r.title}>{r.title || "Untitled Resource"}</h4>
                      <button
                        type="button"
                        className="myr-delete-btn"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="myr-card-subject">
                      <span className="myr-subject-dot" />
                      <span>{r.subject || "No Subject"}</span>
                    </div>

                    <div className="myr-file-name" title={fileName}>
                      {fileName}
                    </div>

                    <div className="myr-card-footer">
                      <span>{fileDate}</span>
                      <span>{fileSize}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredResources.length > 0 && viewMode === "list" && (
          <div className="myr-list">
            {filteredResources.map((r) => {
              const fileType = getFileType(r.fileUrl);
              const fileName =
                r.fileUrl?.split("\\").pop()?.split("/").pop() ||
                "Unknown file";
              const fileDate = formatDate(r.createdAt || r.updatedAt);
              const fileSize = formatFileSize(r.fileSize || r.size);
              const status = (r.status || "pending").toLowerCase();

              return (
                <div className="myr-list-card" key={r._id}>
                  <div
                    className={`myr-list-icon ${
                      fileType === "video" ? "video-list-icon" : "doc-list-icon"
                    }`}
                  >
                    {getFileIcon(fileType)}
                  </div>

                  <div className="myr-list-main">
                    <div className="myr-list-title">{r.title || "Untitled"}</div>
                    <div className="myr-list-meta">
                      <span className="myr-subject-dot" />
                      <span>{r.subject || "No Subject"}</span>
                      <span className="myr-list-filename">{fileName}</span>
                    </div>
                  </div>

                  <div className="myr-list-date">
                    {fileDate} • {fileSize}
                  </div>

                  <div className="myr-list-status-wrap">
                    <span className={`myr-list-status ${status}`}>
                      <span className="status-mini-dot" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="myr-list-actions">
                    <a
                      href={getFileUrl(r.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      title="View"
                    >
                      👁
                    </a>
                    <a
                      href={getFileUrl(r.fileUrl)}
                      download
                      title="Download"
                    >
                      ⬇
                    </a>
                    <button type="button" title="More">
                      ⋮
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}