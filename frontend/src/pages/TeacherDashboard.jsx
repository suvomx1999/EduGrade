import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { 
  PlusCircle, 
  BookOpen, 
  Trash2, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  History,
  Zap,
  MoreVertical,
  GraduationCap
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    text: "",
    modelAnswer: "",
    keywords: "",
    maxMarks: 10,
  });
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(",").map((k) => k.trim()).filter((k) => k !== ""),
      };
      await api.post("/questions", payload);
      setFormData({ text: "", modelAnswer: "", keywords: "", maxMarks: 10 });
      fetchQuestions();
      alert("Question published successfully!");
    } catch (error) {
      console.error("Failed to create question", error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/questions/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error("Failed to delete question", error);
      }
    }
  };

  const toggleSubmissions = async (questionId) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
      return;
    }
    
    if (!submissions[questionId]) {
      try {
        const response = await api.get(`/submissions/question/${questionId}`);
        setSubmissions({ ...submissions, [questionId]: response.data });
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      }
    }
    setExpandedQuestion(questionId);
  };

  const stats = [
    { label: "Total Students", value: "1,256", icon: Users, bg: "bg-dash-orange" },
    { label: "Active Teachers", value: "102", icon: GraduationCap, bg: "bg-dash-purple" },
    { label: "Private Sessions", value: "102", icon: Target, bg: "bg-dash-cyan" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Instructor Console">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className={cn(
            "dash-card p-8 flex items-center justify-between overflow-hidden relative group border-none shadow-xl transition-all duration-500 hover:scale-[1.02]", 
            stat.bg,
            !stat.bg && "bg-dash-navy"
          )}>
            <div className="relative z-10 text-white drop-shadow-sm">
              <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
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
        {/* Create Assignment */}
        <div className="lg:col-span-4">
          <div className="dash-card dash-card-white p-8 sticky top-28 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-dash-orange/5">
            <h2 className="text-2xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <div className="p-2 bg-dash-orange/10 rounded-xl">
                <PlusCircle className="h-6 w-6 text-dash-orange" />
              </div>
              New Assignment
            </h2>
            <form onSubmit={handleCreateQuestion} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                  <BookOpen className="h-3 w-3" />
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all resize-none text-sm font-medium shadow-inner"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Model Answer
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all resize-none text-sm font-medium shadow-inner"
                  value={formData.modelAnswer}
                  onChange={(e) => setFormData({ ...formData, modelAnswer: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Target className="h-3 w-3" />
                    Max Marks
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all text-sm font-black shadow-inner"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Zap className="h-3 w-3" />
                    Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="Separate with commas"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all text-sm font-bold shadow-inner"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-dash-orange text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                Publish to Students
              </button>
            </form>
          </div>
        </div>

        {/* Assignments List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40">
            <h2 className="text-2xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <div className="p-2 bg-dash-purple/10 rounded-xl">
                <FileText className="h-6 w-6 text-dash-purple" />
              </div>
              Published Repository
            </h2>
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="p-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-dash-gray font-bold italic">No questions published yet.</p>
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q._id} className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-dash-purple/30 hover:shadow-[0_20px_40px_-12px_rgba(161,140,209,0.15)] transition-all duration-500 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-black text-dash-navy group-hover:text-dash-purple transition-colors">{q.text}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-1.5 bg-dash-purple/10 text-dash-purple text-[10px] font-black uppercase rounded-xl border border-dash-purple/20 shadow-sm">
                            {q.maxMarks} Points
                          </span>
                          {q.keywords.map((kw, i) => (
                            <span key={i} className="px-4 py-1.5 bg-slate-50 text-dash-gray text-[10px] font-black uppercase rounded-xl border border-slate-100 shadow-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <button
                          onClick={() => toggleSubmissions(q._id)}
                          className={cn(
                            "p-3 rounded-2xl transition-all duration-300",
                            expandedQuestion === q._id ? "bg-dash-purple text-white shadow-xl shadow-purple-200" : "bg-slate-50 text-dash-gray hover:bg-slate-100"
                          )}
                        >
                          <ChevronDown className={cn("h-5 w-5 transition-transform duration-500", expandedQuestion === q._id && "rotate-180")} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-3 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {expandedQuestion === q._id && (
                      <div className="mt-8 pt-8 border-t border-slate-100 space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-dash-gray uppercase tracking-[0.2em] flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            Active Student Attempts
                          </h4>
                          <span className="px-3 py-1 bg-dash-purple/5 text-dash-purple text-[10px] font-black rounded-lg border border-dash-purple/10">
                            {submissions[q._id]?.length || 0} Evaluated
                          </span>
                        </div>
                        {!submissions[q._id] || submissions[q._id].length === 0 ? (
                          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <History className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-xs font-bold text-dash-gray italic">No student submissions recorded for this assignment yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {submissions[q._id].map((sub) => (
                              <div key={sub._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:border-dash-purple/20 transition-all gap-6 group/item">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img 
                                      src={sub.student.avatar || `https://ui-avatars.com/api/?name=${sub.student.name}&background=a18cd1&color=fff`} 
                                      className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-2 ring-white" 
                                      alt="" 
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-dash-navy group-hover/item:text-dash-purple transition-colors">{sub.student.name}</p>
                                    <p className="text-[10px] font-bold text-dash-gray uppercase tracking-widest">{sub.student.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="text-right">
                                    <p className="text-lg font-black text-dash-navy">{sub.score} / {sub.maxMarks}</p>
                                    <span className={cn(
                                      "px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                      sub.percentage >= 85 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                      sub.percentage >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                      {sub.verdict}
                                    </span>
                                  </div>
                                  <div className={cn(
                                    "w-2 h-12 rounded-full shadow-inner",
                                    sub.percentage >= 85 ? "bg-emerald-500" : sub.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                                  )}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
