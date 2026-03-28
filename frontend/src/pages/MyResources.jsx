import { useEffect, useMemo, useState } from "react";
import resourceService from "../services/resource.service";
import "./MyResources.css";

export default function MyResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const getFileUrl = (path) => {
    if (!path) return "#";
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  const getFileType = (fileUrl) => {
    if (!fileUrl) return "other";

    const ext = fileUrl.split(".").pop().toLowerCase();

    if (ext === "pdf") return "document";
    if (ext === "doc" || ext === "docx") return "document";
    if (["mp4", "mov", "mkv", "avi"].includes(ext)) return "video";

    return "other";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "document":
        return "📄";
      case "video":
        return "🎥";
      default:
        return "📁";
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        (resource.title || "").toLowerCase().includes(searchLower) ||
        (resource.subject || "").toLowerCase().includes(searchLower) ||
        (resource.fileUrl || "").toLowerCase().includes(searchLower);

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

  const filters = ["All", "Videos", "Documents", "Pending", "Approved"];

  return (
    <div className="my-resources-page">
      <div className="my-resources-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Uploaded Resources</h1>
            <p className="dashboard-subtitle">
              Manage and track the status of your uploaded files.
            </p>
          </div>

          <a href="/upload" className="upload-btn">
            ⬆ Upload New
          </a>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon green-soft">📚</div>
            <div>
              <p className="stat-label">Total Files</p>
              <h3>{stats.totalFiles}</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon amber-soft">⏳</div>
            <div>
              <p className="stat-label">Pending Review</p>
              <h3>{stats.pendingCount}</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon green-strong">✅</div>
            <div>
              <p className="stat-label">Approved</p>
              <h3>{stats.approvedCount}</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon blue-soft">🎥</div>
            <div>
              <p className="stat-label">Videos</p>
              <h3>{stats.videoCount}</h3>
            </div>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="toolbar">
          <div className="filter-group">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn ${
                  activeFilter === filter ? "active-filter" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search files or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading && <p className="info-text">Loading resources...</p>}

        {!loading && filteredResources.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon">🔍</div>
            <h3>No resources found</h3>
            <p>Try changing your search or filter.</p>
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && filteredResources.length > 0 && (
          <div className="resources-grid">
            {filteredResources.map((r) => {
              const fileType = getFileType(r.fileUrl);
              const fileName =
                r.fileUrl?.split("\\").pop()?.split("/").pop() || "Unknown file";

              return (
                <div className="resource-card" key={r._id}>
                  <div
                    className={`card-strip ${
                      fileType === "video" ? "video-strip" : "doc-strip"
                    }`}
                  ></div>

                  <div className="card-body">
                    <div className="card-head">
                      <div className={`card-icon ${fileType}`}>
                        {getFileIcon(fileType)}
                      </div>

                      <span
                        className={`status-badge ${(r.status || "Pending").toLowerCase()}`}
                      >
                        {r.status || "Pending"}
                      </span>
                    </div>

                    <div className="card-content">
                      <h3 title={r.title}>{r.title}</h3>

                      <span className="subject-badge">
                        {r.subject || "No Subject"}
                      </span>

                      <p className="file-name" title={fileName}>
                        {fileName}
                      </p>
                    </div>

                    <div className="card-actions">
                      <a
                        href={getFileUrl(r.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="view-btn"
                      >
                        View
                      </a>

                      <a
                        href={getFileUrl(r.fileUrl)}
                        download
                        className="download-btn"
                      >
                        Download
                      </a>
                    </div>
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