import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Assignments from "./pages/Assignments";
import Results from "./pages/Results";
import MyQuestions from "./pages/MyQuestions";
import ClassStats from "./pages/ClassStats";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/assignments" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Assignments />
            </ProtectedRoute>
          } />

          <Route path="/results" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Results />
            </ProtectedRoute>
          } />

          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/my-questions" element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <MyQuestions />
            </ProtectedRoute>
          } />

          <Route path="/class-stats" element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <ClassStats />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 handler */}
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-2xl font-bold">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
