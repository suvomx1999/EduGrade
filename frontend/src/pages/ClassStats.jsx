import { useState, useEffect } from "react";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";
import { Users, GraduationCap, Target, TrendingUp, BarChart3, PieChart, ChevronRight, Activity, Download } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ClassStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch class stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/export/submissions", {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv'
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `academic_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      const errorMessage = error.response?.data?.message || "Failed to export report. Please ensure you have teacher permissions.";
      alert(errorMessage);
    }
  };

  const performanceMetrics = [
    { label: "Active Students", value: stats?.userCount || "0", icon: Users, color: "text-dash-orange", bg: "bg-dash-orange/10" },
    { label: "Course Content", value: stats?.questionCount || "0", icon: GraduationCap, color: "text-dash-purple", bg: "bg-dash-purple/10" },
    { label: "Global Submissions", value: stats?.submissionCount || "0", icon: Activity, color: "text-dash-cyan", bg: "bg-dash-cyan/10" },
    { label: "Avg. Class Score", value: `${stats?.averageScore || 0}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <DashboardLayout title="Class Statistics" subtitle="Global Academic Performance Insights">
      <div className="space-y-10">
        {/* Metric Grid & Export */}
        <div className="flex flex-col xl:flex-row gap-8 items-stretch">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {performanceMetrics.map((metric, i) => (
              <div key={i} className="dash-card dash-card-white p-8 flex items-center gap-6 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl shadow-slate-200/20 group hover:scale-[1.02] transition-all duration-500">
                <div className={cn("p-5 rounded-[1.5rem] shadow-lg transition-transform group-hover:scale-110 duration-500", metric.bg, metric.color)}>
                  <metric.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-dash-gray uppercase tracking-[0.2em] mb-1">{metric.label}</p>
                  <h3 className="text-3xl font-black text-dash-navy tracking-tight">{metric.value}</h3>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleExport}
            className="xl:w-64 dash-card p-8 bg-dash-navy text-white flex flex-col items-center justify-center gap-4 hover:bg-[#151c4a] transition-all group relative overflow-hidden border-none shadow-2xl shadow-navy-500/20"
          >
            <div className="relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-md ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500">
              <Download className="h-7 w-7 text-dash-orange" />
            </div>
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-center">Export Full Report</span>
            
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Performance Distribution Chart (Mock) */}
          <div className="lg:col-span-8">
            <div className="dash-card dash-card-white p-10 h-full bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <div>
                  <h2 className="text-2xl font-black text-dash-navy tracking-tight">Academic Distribution</h2>
                  <p className="text-xs font-bold text-dash-gray mt-1">Real-time batch performance analytics</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-dash-purple shadow-sm"></div>
                    <span className="text-[10px] font-black text-dash-gray uppercase tracking-widest">Mastery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-100 shadow-inner"></div>
                    <span className="text-[10px] font-black text-dash-gray uppercase tracking-widest">Baseline</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-72">
                {stats?.distribution && stats.distribution.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="range" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a3aed0', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <YAxis hide={true} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          fontSize: '10px',
                          fontWeight: '900',
                          textTransform: 'uppercase'
                        }} 
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[8, 8, 0, 0]} 
                        animationDuration={1500}
                      >
                        {stats.distribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === stats.distribution.length - 1 ? '#ff9a8b' : '#a18cd1'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <BarChart3 className="h-8 w-8 text-slate-200 mb-2" />
                    <p className="text-[10px] font-black text-dash-gray uppercase tracking-widest">Awaiting student submissions...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="lg:col-span-4">
            <div className="dash-card dash-card-white p-10 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10">
              <h2 className="text-2xl font-black text-dash-navy tracking-tight mb-10 flex items-center gap-3">
                <div className="p-2 bg-dash-cyan/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-dash-cyan" />
                </div>
                Elite Performers
              </h2>
              <div className="space-y-8">
                {[
                  { name: "Lucas Jones", score: "98.2%", rank: 1, avatar: "https://ui-avatars.com/api/?name=Lucas+Jones&background=ff9a8b&color=fff" },
                  { name: "Sarah Smith", score: "95.5%", rank: 2, avatar: "https://ui-avatars.com/api/?name=Sarah+Smith&background=a18cd1&color=fff" },
                  { name: "James Wilson", score: "92.1%", rank: 3, avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=4facfe&color=fff" },
                  { name: "Elena Gomez", score: "89.8%", rank: 4, avatar: "https://ui-avatars.com/api/?name=Elena+Gomez&background=ff9a8b&color=fff" },
                ].map((student, i) => (
                  <div key={i} className="flex items-center gap-5 group cursor-pointer">
                    <div className="relative">
                      <img src={student.avatar} className="h-14 w-14 rounded-[1.25rem] object-cover shadow-md ring-2 ring-white group-hover:ring-dash-purple/30 transition-all duration-500" alt="" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-[11px] font-black text-dash-navy shadow-lg border border-slate-50">
                        #{student.rank}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-dash-navy group-hover:text-dash-purple transition-colors">{student.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <p className="text-[11px] font-black text-dash-purple uppercase tracking-[0.15em]">Mastery: {student.score}</p>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <ChevronRight className="h-4 w-4 text-dash-gray" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-12 py-5 bg-slate-50 text-dash-gray rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-dash-orange hover:text-white hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500">
                Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassStats;
