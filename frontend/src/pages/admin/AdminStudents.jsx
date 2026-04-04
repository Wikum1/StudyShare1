import { useEffect, useState } from "react";

export default function AdminStudents() {
  const token = localStorage.getItem("token");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadStudents();
  }, [token]);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Students</h1>
        <p>View all registered students.</p>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="3">No students found</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}