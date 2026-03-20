import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Calendar,
  TrendingUp,
  Mail,
  UserCheck,
  Activity,
  Globe,
  Lock,
  ChevronRight,
  GraduationCap,
  Target
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, qRes] = await Promise.all([
        api.get("/auth/admin/stats"),
        api.get("/admin/users"),
        api.get("/questions"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setQuestions(qRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchData();
      alert("System permissions updated.");
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  const summaryStats = [
    { label: "Academic Entities", value: stats?.userCount || 0, icon: Users, bg: "bg-dash-orange" },
    { label: "Curriculum Repository", value: stats?.questionCount || 0, icon: GraduationCap, bg: "bg-dash-purple" },
    { label: "Global Syncs", value: stats?.submissionCount || 0, icon: Target, bg: "bg-dash-cyan" },
  ];

  const genderData = [
    { name: 'Male', value: 60, color: '#ff9a8b' },
    { name: 'Female', value: 35, color: '#a18cd1' },
    { name: 'Other', value: 5, color: '#4facfe' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="System Administration">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {summaryStats.map((stat, idx) => (
          <div key={idx} className={cn(
            "dash-card p-10 flex items-center justify-between overflow-hidden relative group border-none shadow-2xl transition-all duration-500 hover:scale-[1.02]", 
            stat.bg,
            !stat.bg && "bg-dash-navy"
          )}>
            <div className="relative z-10 text-white drop-shadow-sm">
              <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.25em] mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
            </div>
            <div className="relative z-10 p-4 bg-white/20 rounded-2xl backdrop-blur-md ring-1 ring-white/30 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-black/5 rounded-full blur-xl"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Management */}
        <div className="lg:col-span-8">
          <div className="dash-card dash-card-white p-10 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10">
            <h2 className="text-2xl font-black text-dash-navy tracking-tight mb-10 flex items-center gap-4">
              <div className="p-2 bg-dash-orange/10 rounded-xl">
                <UserCheck className="h-6 w-6 text-dash-orange" />
              </div>
              Identity Management
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-[10px] font-black text-dash-gray uppercase tracking-[0.25em] border-b border-slate-100">
                    <th className="px-6 py-5 text-left">Academic Entity</th>
                    <th className="px-6 py-5 text-left">Access Level</th>
                    <th className="px-6 py-5 text-left">Registry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u._id} className="group hover:bg-white/50 transition-all duration-300">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar} className="h-12 w-12 rounded-2xl object-cover shadow-md ring-2 ring-white group-hover:ring-dash-orange/20 transition-all" alt="" />
                          <div>
                            <p className="text-base font-black text-dash-navy group-hover:text-dash-orange transition-colors">{u.name}</p>
                            <p className="text-[11px] font-bold text-dash-gray uppercase tracking-widest">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="relative inline-block">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={cn(
                              "text-[10px] font-black px-4 py-2 rounded-xl border-none outline-none cursor-pointer uppercase tracking-widest transition-all shadow-sm appearance-none pr-10",
                              u.role === "admin" ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                              u.role === "teacher" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                              "bg-dash-purple/5 text-dash-purple border border-dash-purple/10"
                            )}
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none rotate-90 opacity-40" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-dash-gray/60" />
                          <span className="text-xs font-black text-dash-gray uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics & Top Students */}
        <div className="lg:col-span-4 space-y-8">
          <div className="dash-card dash-card-white p-10 flex flex-col items-center bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10">
            <h2 className="text-xl font-black text-dash-navy tracking-tight mb-10 self-start flex items-center gap-3">
              <div className="p-2 bg-dash-purple/10 rounded-xl">
                <Globe className="h-5 w-5 text-dash-purple" />
              </div>
              Gender Analytics
            </h2>
            <div className="relative w-56 h-56 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '10px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-dash-navy tracking-tighter">60%</span>
                <span className="text-[10px] font-black text-dash-gray uppercase tracking-[0.2em] mt-1">Dominant</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full px-4">
              <div className="text-center group cursor-default">
                <div className="w-2 h-2 rounded-full bg-dash-orange mx-auto mb-2 shadow-[0_0_8px_rgba(255,154,139,0.5)]"></div>
                <p className="text-[11px] font-black text-dash-navy">60%</p>
                <p className="text-[9px] font-bold text-dash-gray uppercase tracking-widest mt-0.5">Male</p>
              </div>
              <div className="text-center group cursor-default">
                <div className="w-2 h-2 rounded-full bg-dash-purple mx-auto mb-2 shadow-[0_0_8px_rgba(161,140,209,0.5)]"></div>
                <p className="text-[11px] font-black text-dash-navy">35%</p>
                <p className="text-[9px] font-bold text-dash-gray uppercase tracking-widest mt-0.5">Female</p>
              </div>
              <div className="text-center group cursor-default">
                <div className="w-2 h-2 rounded-full bg-dash-cyan mx-auto mb-2 shadow-[0_0_8px_rgba(7facfe,0.5)]"></div>
                <p className="text-[11px] font-black text-dash-navy">5%</p>
                <p className="text-[9px] font-bold text-dash-gray uppercase tracking-widest mt-0.5">Other</p>
              </div>
            </div>
          </div>

          <div className="dash-card dash-card-white p-10 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-dash-navy tracking-tight flex items-center gap-3">
                <div className="p-2 bg-dash-cyan/10 rounded-xl">
                  <Activity className="h-5 w-5 text-dash-cyan" />
                </div>
                Elite List
              </h2>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <select className="text-[9px] font-black text-dash-gray uppercase tracking-[0.2em] bg-transparent outline-none border-none cursor-pointer">
                  <option>Class 10A</option>
                  <option>Class 12B</option>
                </select>
              </div>
            </div>
            <div className="space-y-8">
              {[
                { name: "Lucas Jones", score: "95% Mastery", avatar: "https://ui-avatars.com/api/?name=Lucas+Jones&background=ff9a8b&color=fff" },
                { name: "Sarah Smith", score: "92% Mastery", avatar: "https://ui-avatars.com/api/?name=Sarah+Smith&background=a18cd1&color=fff" },
                { name: "James Wilson", score: "88% Mastery", avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=4facfe&color=fff" },
              ].map((student, i) => (
                <div key={i} className="flex items-center gap-5 group cursor-pointer">
                  <img src={student.avatar} className="h-12 w-12 rounded-2xl object-cover shadow-md ring-2 ring-white group-hover:ring-dash-orange/20 transition-all duration-500" alt="" />
                  <div className="flex-1">
                    <p className="text-base font-black text-dash-navy group-hover:text-dash-orange transition-colors tracking-tight">{student.name}</p>
                    <p className="text-[10px] font-black text-dash-orange uppercase tracking-[0.2em] mt-0.5">{student.score}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <ChevronRight className="h-4 w-4 text-dash-gray" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-12 py-5 bg-dash-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#151c4a] hover:shadow-2xl hover:shadow-navy-500/20 transition-all duration-500">
              System Registry
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
