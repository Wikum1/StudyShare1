import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "./AdminPages.css";

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}