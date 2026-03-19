import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Shield, GraduationCap, LayoutDashboard, Bell, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "teacher") return "/teacher";
    return "/student";
  };

  return (
    <nav className="glass border-b border-slate-200/50 sticky top-0 z-50 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight leading-none">
                EduGrade <span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Evaluation Platform</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
            {[
              { label: "Dashboard", icon: LayoutDashboard, path: getDashboardLink() },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  location.pathname === item.path
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Settings className="h-5 w-5" />
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            {user && (
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">{user.role}</p>
                </div>
                
                <div className="relative group cursor-pointer">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                <button
                  onClick={logout}
                  className="ml-2 p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
