import { useEffect, useState } from "react";
import "./AdminStudents.css";

export default function AdminStudents() {
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/students/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setMessage("Student deleted successfully");
      loadStudents();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  // 🔍 FILTER
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-students-page">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Students</h1>
          <p>Manage all registered students</p>
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MESSAGE */}
      {message && <div className="admin-alert">{message}</div>}

      {/* TABLE */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="center">
                  Loading...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="4" className="center">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="student-cell">
                    <div className="avatar">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{student.name}</span>
                  </td>

                  <td>{student.email}</td>

                  <td>
                    <span className="role-badge">{student.role}</span>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}