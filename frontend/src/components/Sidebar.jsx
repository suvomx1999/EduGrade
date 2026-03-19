import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  LogOut,
  Users,
  FileText,
  PieChart,
  Globe
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = {
    student: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/student" },
      { label: "Assignments", icon: BookOpen, path: "/assignments" },
      { label: "Results", icon: PieChart, path: "/results" },
    ],
    teacher: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/teacher" },
      { label: "My Questions", icon: FileText, path: "/my-questions" },
      { label: "Class Stats", icon: PieChart, path: "/class-stats" },
    ],
    admin: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { label: "User Control", icon: Users, path: "/admin" },
      { label: "Global Registry", icon: Globe, path: "/admin" },
    ]
  };

  const currentMenu = menuItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-slate-100 fixed left-0 top-0 z-40 hidden lg:flex flex-col">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-dash-orange rounded-xl shadow-lg shadow-orange-100">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-black text-dash-navy tracking-tight">EduGrade AI</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {currentMenu.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              location.pathname === item.path
                ? "sidebar-link-active"
                : "text-dash-gray hover:bg-slate-50 hover:text-dash-navy"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-8 space-y-2 border-t border-slate-50">
        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold text-dash-gray hover:bg-slate-50 hover:text-dash-navy transition-all">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold text-dash-gray hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
