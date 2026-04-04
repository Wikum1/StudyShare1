import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

/* Public Components */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* Dashboard Components */
import DashboardNavbar from "./components/DashboardNavbar";
import ReminderToast from "./components/ReminderToast";

/* Public Pages */
import Home from "./pages/Home";
import ResourcesPage from "./pages/ResourcesPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import ForumPage from "./pages/ForumPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";

/* Auth Pages */
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

/* Student Dashboard Pages */
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import UploadResource from "./pages/UploadResource";
import MyResources from "./pages/MyResources";
<<<<<<< HEAD
=======
import AdminDashboard from "./pages/AdminDashboard";
import StudyCalendar from "./pages/StudyCalendar";
>>>>>>> a67744694ef241bae4f3463ad6e6db952ee6a04e

/* Admin Pages */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminResources from "./pages/admin/AdminResources";
import AdminActivities from "./pages/admin/AdminActivities";

/* ================= PUBLIC LAYOUT ================= */
function PublicLayout() {
  return (
    <>
      <ReminderToast />
      <Navbar />
      <main style={{ minHeight: "80vh" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/* ================= STUDENT DASHBOARD LAYOUT ================= */
function DashboardLayout() {
  return (
    <>
      <ReminderToast />
      <DashboardNavbar />
      <main style={{ minHeight: "80vh", padding: "30px" }}>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/planner" element={<StudyPlannerPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ================= AUTH PAGES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= STUDENT DASHBOARD ================= */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="upload" element={<UploadResource />} />
          <Route path="my-resources" element={<MyResources />} />
        </Route>

<<<<<<< HEAD
        {/* ================= ADMIN DASHBOARD ================= */}
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="activities" element={<AdminActivities />} />
        </Route>
=======
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/upload"
          element={
            <DashboardLayout>
              <UploadResource />
            </DashboardLayout>
          }
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route
          path="/dashboard/my-resources"
          element={
            <DashboardLayout>
              <MyResources />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/study-planner"
          element={
            <DashboardLayout>
              <StudyCalendar />
            </DashboardLayout>
          }
        />
>>>>>>> a67744694ef241bae4f3463ad6e6db952ee6a04e
      </Routes>
    </Router>
  );
}

export default App;