import { useEffect, useState } from "react";
import adminResourceService from "../../services/admin/adminResource.service";

export default function ResourceModeration() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const data = await adminResourceService.getAllResources();
      setResources(data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleApprove = async (id) => {
    await adminResourceService.approveResource(id);
    fetchResources();
  };

  const handleReject = async (id) => {
    await adminResourceService.rejectResource(id);
    fetchResources();
  };

  const getFileType = (fileUrl) => {
    if (!fileUrl) return "Unknown";
    const ext = fileUrl.split(".").pop().toLowerCase();

    if (ext === "pdf") return "PDF";
    if (ext === "doc" || ext === "docx") return "Word";
    if (["mp4", "mov", "mkv", "avi"].includes(ext)) return "Video";
    return "Other";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF": return "📄";
      case "Word": return "📘";
      case "Video": return "🎥";
      default: return "📁";
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h2>Admin Resource Moderation</h2>

        {loading && <p>Loading resources...</p>}

        <div className="resource-grid">
          {resources.map((r) => {
            const fileType = getFileType(r.fileUrl);
            const fileName = r.fileUrl?.split("/").pop();

            return (
              <div className="square-card" key={r._id}>
                {/* Top */}
                <div>
                  <h4>{r.title}</h4>
                  <p><strong>Subject:</strong> {r.subject}</p>
                  <p>{getFileIcon(fileType)} {fileType}</p>
                  <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                    {fileName}
                  </p>
                </div>

                {/* Bottom */}
                <div>
                  <span
                    style={{
                      backgroundColor:
                        r.status === "Approved"
                          ? "#4CAF50"
                          : r.status === "Rejected"
                          ? "#f44336"
                          : "#ff9800",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      display: "inline-block",
                      marginBottom: "10px"
                    }}
                  >
                    {r.status}
                  </span>

                  {r.status === "Pending" && (
                    <div>
                      <button
                        onClick={() => handleApprove(r._id)}
                        style={{
                          marginRight: "8px",
                          backgroundColor: "#4CAF50"
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(r._id)}
                        style={{
                          backgroundColor: "#f44336"
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}