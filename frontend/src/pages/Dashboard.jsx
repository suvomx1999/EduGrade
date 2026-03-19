import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "teacher":
      return <Navigate to="/teacher" replace />;
    case "student":
      return <Navigate to="/student" replace />;
    default:
      return <div className="text-center p-10 text-xl text-red-600">Unknown Role: {user.role}</div>;
  }
};

export default Dashboard;
