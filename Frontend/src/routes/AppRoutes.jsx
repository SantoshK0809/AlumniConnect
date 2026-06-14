import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import RoleDashboard from "../components/Dashboard/RoleDashboard";
import StudentProfile from "../pages/student/Profile";
import AlumniProfile from "../pages/alumni/Profile";
import TeacherProfile from "../pages/teacher/Profile";
import AdminProfile from "../pages/admin/Profile";
import StudentFeed from "../pages/student/Feed";
import AlumniFeed from "../pages/alumni/Feed";
import TeacherFeed from "../pages/teacher/Feed";
import Directory from "../pages/Directory";
import TeacherAdminManage from "../pages/teacher/ManageUser";
import ProfileView from "../pages/ProfileView";
import Messages from "../pages/Messages";
import JobBoard from "../pages/JobBoard";
import PostJob from "../pages/PostJob";
import Connections from "../pages/ConnectionPage";
import { useAuth } from "../hooks/useAuth";
import ResumeAnalysis from "../features/Resume/pages/ResumeAnalysis.jsx";
import Interview from "../features/Resume/pages/Interview.jsx";
import NotFound from "../pages/NotFound.jsx";
import MentorRequestsPage from "../features/mentorship/pages/MentorRequestsPage.jsx";
import SentRequestsPage from "../features/mentorship/pages/SentRequestsPage.jsx";
import AlumniDiscovery from "../pages/alumni/AlumniDiscovery.jsx";
import PublicAlumniProfile from "../pages/alumni/PublicAlumniProfile.jsx";
import EditAlumniProfessionalProfile from "../components/achievement/EditAlumniProfessionalProfile.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (
    allowedRoles &&
    !allowedRoles.some((r) => r.toLowerCase() === user.role.toLowerCase())
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  const DashboardRedirect = () => {
    const role = user?.role?.toLowerCase();
    let path = "/login";
    if (role === "admin") path = "/teacher/admin/dashboard";
    else if (role) path = `/${role}/dashboard`;
    return <Navigate to={path} replace />;
  };

  const withDashboardLayout = (component) => (
    <DashboardLayout>{component}</DashboardLayout>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Universal Profile Route */}
      <Route
        path="/profile/:role/:userId"
        element={
          <ProtectedRoute children={withDashboardLayout(<ProfileView />)} />
        }
      />

      {/* Dashboard redirect */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute children={<DashboardRedirect />} />}
      />

      {/* Student Routes */}
      <Route path="/student/*">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<RoleDashboard />)}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<StudentProfile />)}
            />
          }
        />
        <Route
          path="feed"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<StudentFeed />)}
            />
          }
        />
        {/* <Route
          path="mentor-requests"
          element={withDashboardLayout(<MentorRequestsPage />)}
        /> */}
        <Route
          path="directory"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<Directory />)}
            />
          }
        />
        <Route
          path="network"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<Connections />)}
            />
          }
        />
        <Route
          path="jobs"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<JobBoard />)}
            />
          }
        />
        <Route
          path="resume"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              {withDashboardLayout(<ResumeAnalysis />)}
            </ProtectedRoute>
          }
        />
        {/* <Route
        path="interview/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
            {withDashboardLayout(<Interview />)}
          </ProtectedRoute>
        }
      /> */}
        <Route
          path="messages"
          element={
            <ProtectedRoute
              allowedRoles={["Student"]}
              children={withDashboardLayout(<Messages />)}
            />
          }
        />
      </Route>

      {/* Alumni Routes */}
      <Route path="/alumni/*">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<RoleDashboard />)}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<AlumniProfile />)}
            />
          }
        />
        <Route
          path="feed"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<AlumniFeed />)}
            />
          }
        />
        <Route
          path="directory"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<Directory />)}
            />
          }
        />
        <Route
          path="network"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<Connections />)}
            />
          }
        />
        <Route
          path="jobs"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<JobBoard />)}
            />
          }
        />
        <Route
          path="resume"
          element={
            <ProtectedRoute allowedRoles={["Alumni"]}>
              {withDashboardLayout(<ResumeAnalysis />)}
            </ProtectedRoute>
          }
        />
        <Route
        path="professional-profile/edit"
        element={
          <ProtectedRoute roles={["alumni"]}>
            {withDashboardLayout(<EditAlumniProfessionalProfile />)}
          </ProtectedRoute>
        }
      />
        {/* <Route
        path="interview/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
            {withDashboardLayout(<Interview />)}
          </ProtectedRoute>
        }
      /> */}
        <Route
          path="jobs/create"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<PostJob />)}
            />
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute
              allowedRoles={["Alumni"]}
              children={withDashboardLayout(<Messages />)}
            />
          }
        />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher/*">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<RoleDashboard />)}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<TeacherProfile />)}
            />
          }
        />
        <Route
          path="feed"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<TeacherFeed />)}
            />
          }
        />
        <Route
          path="manage"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<TeacherAdminManage />)}
            />
          }
        />
        <Route
          path="directory"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<Directory />)}
            />
          }
        />
        <Route
          path="network"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<Connections />)}
            />
          }
        />
        <Route
          path="jobs"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<JobBoard />)}
            />
          }
        />
        <Route
          path="jobs/create"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<PostJob />)}
            />
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute
              allowedRoles={["Teacher"]}
              children={withDashboardLayout(<Messages />)}
            />
          }
        />

        {/* Admin specific within Teacher scope */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<RoleDashboard />)}
            />
          }
        />
        <Route
          path="admin/feed"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<TeacherFeed />)}
            />
          }
        />
        <Route
          path="admin/manage"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<TeacherAdminManage />)}
            />
          }
        />
        <Route
          path="admin/directory"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<Directory />)}
            />
          }
        />
        <Route
          path="admin/network"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<Connections />)}
            />
          }
        />
        <Route
          path="admin/jobs"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<JobBoard />)}
            />
          }
        />
        <Route
          path="admin/messages"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
              children={withDashboardLayout(<Messages />)}
            />
          }
        />
      </Route>

      {/* <Route>
        <Route path="/resume" element={<ProtectedRoute allowedRoles={['Student', 'Alumni']} children={withDashboardLayout(<ResumeAnalysis />)} />} />
      </Route> */}
      {/* 
      <Route
        path="/resume"
        element={
          <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
            {withDashboardLayout(<ResumeAnalysis />)}
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/messages/:targetUserId?"
        element={
          <ProtectedRoute>{withDashboardLayout(<Messages />)}</ProtectedRoute>
        }
      />

      <Route
        path="/:role/alumni-discovery"
        element={
          <ProtectedRoute>
            {withDashboardLayout(<AlumniDiscovery />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/:userId"
        element={
          <ProtectedRoute roles={["alumni", "student"]}>
            {withDashboardLayout(<PublicAlumniProfile />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/alumni/mentor-requests"
        element={
          <ProtectedRoute roles={["alumni"]}>
            {withDashboardLayout(<MentorRequestsPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/mentor-requests"
        element={
          <ProtectedRoute roles={["student", "alumni"]}>
            {withDashboardLayout(<SentRequestsPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
            {withDashboardLayout(<Interview />)}
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
