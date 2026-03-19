import { useState, useEffect } from "react";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";
import { Award, TrendingUp, CheckCircle2, AlertCircle, Clock, ChevronRight, BarChart3, Target, Sparkles, Zap, Calendar, FileText } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Results = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/submissions/mine");
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    } finally {
      setLoading(false);
    }
  };

  const avgMastery = submissions.length > 0 
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length) 
    : 0;

  return (
    <DashboardLayout title="Academic Results" subtitle="Detailed Performance Analytics">
      <div className="space-y-10">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="dash-card p-10 bg-dash-orange text-white border-none shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Global Ranking</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black mb-2 tracking-tight">Top 12%</h3>
              <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest">Across all evaluations</p>
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <div className="dash-card p-10 bg-dash-purple text-white border-none shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                <Target className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Avg. Mastery</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black mb-2 tracking-tight">{avgMastery}%</h3>
              <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest">Semantic accuracy score</p>
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <div className="dash-card p-10 bg-dash-cyan text-white border-none shadow-2xl shadow-cyan-500/20 relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                <Award className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-80">Total Syncs</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black mb-2 tracking-tight">{submissions.length}</h3>
              <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest">Completed submissions</p>
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>

        {/* Detailed Feedback List */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-dash-navy tracking-tight flex items-center gap-4">
            <div className="p-2 bg-dash-purple/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-dash-purple" />
            </div>
            Performance History
          </h2>

          <div className="grid grid-cols-1 gap-8">
            {loading ? (
              <div className="p-20 text-center animate-pulse">
                <div className="h-16 w-16 bg-slate-100 rounded-full mx-auto mb-6"></div>
                <p className="text-dash-gray font-black uppercase tracking-[0.3em] text-xs">Fetching Evaluations...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-24 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                <Clock className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                <p className="text-dash-gray font-black uppercase tracking-widest">No evaluated submissions yet.</p>
                <p className="text-xs text-dash-gray/60 mt-2">Start your first assignment to see results</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub._id} className="dash-card dash-card-white p-10 group bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10 hover:border-dash-purple/30 transition-all duration-500">
                  <div className="flex flex-col xl:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border",
                          sub.percentage >= 85 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          sub.percentage >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {sub.verdict}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-dash-gray uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Calendar className="h-3.5 w-3.5 opacity-60" />
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-dash-navy tracking-tight">{sub.question.text}</h3>
                        <div className="relative">
                          <p className="text-sm text-dash-navy/80 leading-relaxed italic bg-white/40 p-6 rounded-[2rem] border-l-4 border-dash-purple/30 shadow-inner">
                            "{sub.answer}"
                          </p>
                          <div className="absolute -top-3 -right-3 p-2 bg-white rounded-xl shadow-md border border-slate-50">
                            <FileText className="h-4 w-4 text-dash-purple/40" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-dash-purple/5 rounded-[2rem] border border-dash-purple/10 shadow-inner group/feedback hover:bg-white/40 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-dash-purple animate-pulse" />
                            <p className="text-[10px] font-black text-dash-purple uppercase tracking-[0.25em]">AI Feedback</p>
                          </div>
                          <p className="text-xs font-bold text-dash-navy/80 leading-relaxed">{sub.feedback}</p>
                        </div>
                        <div className="p-6 bg-dash-orange/5 rounded-[2rem] border border-dash-orange/10 shadow-inner group/keywords hover:bg-white/40 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-dash-orange" />
                            <p className="text-[10px] font-black text-dash-orange uppercase tracking-[0.25em]">Matched Keywords</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sub.matchedKeywords.length > 0 ? sub.matchedKeywords.map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 bg-white text-dash-orange text-[9px] font-black uppercase rounded-xl border border-dash-orange/20 shadow-sm hover:scale-110 transition-transform">
                                {kw}
                              </span>
                            )) : <span className="text-[10px] font-bold text-dash-gray italic">No direct matches found</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-64 flex flex-col items-center justify-center space-y-6 border-l border-slate-100/50 xl:pl-10">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray="351.8"
                            strokeDashoffset={351.8 * (1 - sub.percentage / 100)}
                            className={cn(
                              "transition-all duration-1000 shadow-xl",
                              sub.percentage >= 85 ? "text-emerald-500" : sub.percentage >= 50 ? "text-amber-500" : "text-rose-500"
                            )}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-dash-navy">{Math.round(sub.percentage)}%</span>
                          <span className="text-[8px] font-black text-dash-gray uppercase tracking-widest mt-1">Mastery</span>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm w-full">
                        <p className="text-2xl font-black text-dash-navy tracking-tight">{sub.score} / {sub.maxMarks}</p>
                        <p className="text-[9px] font-black text-dash-gray uppercase tracking-widest mt-1">Points Earned</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
