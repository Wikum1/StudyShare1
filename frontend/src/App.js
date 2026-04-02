import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Public Components */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* Dashboard Components */
import DashboardNavbar from "./components/DashboardNavbar";

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

/* Dashboard Pages */
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import UploadResource from "./pages/UploadResource";
import MyResources from "./pages/MyResources";
import AdminDashboard from "./pages/AdminDashboard";
import StudyCalendar from "./pages/StudyCalendar";
import FeedWallPage from "./pages/dashboard/feedWallPage";

/* PUBLIC LAYOUT */
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh" }}>{children}</main>
      <Footer />
    </>
  );
}

/* DASHBOARD LAYOUT */
function DashboardLayout({ children }) {
  return (
    <>
      <DashboardNavbar />
      <main style={{ minHeight: "80vh", padding: "30px" }}>{children}</main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC WEBSITE */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/resources"
          element={
            <PublicLayout>
              <ResourcesPage />
            </PublicLayout>
          }
        />

        <Route
          path="/planner"
          element={
            <PublicLayout>
              <StudyPlannerPage />
            </PublicLayout>
          }
        />

        <Route
          path="/forum"
          element={
            <PublicLayout>
              <ForumPage />
            </PublicLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <PublicLayout>
              <AdminPage />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />

        {/* AUTH PAGES */}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* DASHBOARD AREA */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/wall"
          element={
            <DashboardLayout>
              <FeedWallPage />
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
      </Routes>
    </Router>
  );
}

export default App;
