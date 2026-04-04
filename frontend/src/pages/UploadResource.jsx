import { useState } from "react";
import { useNavigate } from "react-router-dom";
import resourceService from "../services/resource.service";
import "./UploadResource.css";

export default function UploadResource() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    file: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description || !formData.subject || !formData.file) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("subject", formData.subject);
      data.append("file", formData.file);

      await resourceService.uploadResource(data);

      alert("Resource uploaded successfully!");
      // Show the student the upload notification immediately.
      navigate("/dashboard/notifications");

      setFormData({
        title: "",
        description: "",
        subject: "",
        file: null
      });

    } catch (err) {
      console.error(err);
     setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      <div className="upload-card">

        <h2 className="upload-title">📤 Upload Study Resource</h2>
        <p className="upload-subtitle">
          Share notes, assignments, and tutorials with other students.
        </p>

        {error && <div className="upload-error">{error}</div>}

        <form className="upload-form" onSubmit={handleSubmit}>

          <div className="form-group"> 
            <label>Title</label>
            <input
              name="title"
              placeholder="Enter resource title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe this resource"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              name="subject"
              placeholder="Example: Mathematics, Programming"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Upload File</label>

            <div className="file-upload">
              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx,video/*"
                onChange={handleChange}
              />
              <span>
                {formData.file ? formData.file.name : "Choose PDF, DOC, or Video"}
              </span>
            </div>
          </div>

          <button className="upload-btn" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Resource"}
          </button>

        </form>
      </div>

    </div>
  );
}