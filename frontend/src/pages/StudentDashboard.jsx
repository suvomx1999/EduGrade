import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BookOpen, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  RotateCcw,
  Sparkles,
  Search,
  Users,
  GraduationCap,
  TrendingUp,
  FileText
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        api.get("/questions"),
        api.get("/submissions/mine"),
      ]);
      setQuestions(qRes.data);
      setSubmissions(sRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (questionId) => {
    const answer = answers[questionId];
    if (!answer || answer.trim() === "") {
      alert("Please write an answer first.");
      return;
    }

    setSubmitting(questionId);
    try {
      await api.post("/submissions", { questionId, answer });
      await fetchData();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setSubmitting(null);
    }
  };

  const getSubmissionForQuestion = (questionId) => {
    return submissions.find((s) => (s.question._id || s.question) === questionId);
  };

  const stats = [
    { label: "Active Assignments", value: questions.length, icon: BookOpen, bg: "bg-dash-orange" },
    { label: "Submissions", value: submissions.length, icon: GraduationCap, bg: "bg-dash-purple" },
    { label: "Avg. Mastery", value: `${submissions.length > 0 ? Math.round(submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length) : 0}%`, icon: Users, bg: "bg-dash-cyan" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Student Workspace">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className={cn(
            "dash-card p-8 flex items-center justify-between overflow-hidden relative group border-none shadow-xl transition-all duration-500 hover:scale-[1.02]", 
            stat.bg,
            !stat.bg && "bg-dash-navy" // Fallback to navy if bg is missing
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
        {/* Assignments List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-dash-navy tracking-tight flex items-center gap-3">
                <div className="p-2 bg-dash-orange/10 rounded-xl">
                  <FileText className="h-6 w-6 text-dash-orange" />
                </div>
                Active Assignments
              </h2>
              <span className="px-4 py-1 bg-slate-100 text-dash-gray text-[10px] font-black uppercase rounded-full tracking-widest border border-slate-200">
                {questions.length} Pending
              </span>
            </div>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="p-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-dash-gray font-bold">No active assignments found.</p>
                </div>
              ) : (
                questions.map((q) => {
                  const submission = getSubmissionForQuestion(q._id);
                  const isSubmitted = !!submission;

                  return (
                    <div key={q._id} className={cn(
                      "p-8 rounded-[2rem] border transition-all duration-500 group shadow-sm",
                      isSubmitted ? "bg-slate-50/50 border-slate-100 opacity-80" : "bg-white border-slate-100 hover:border-dash-orange/30 hover:shadow-[0_20px_40px_-12px_rgba(255,154,139,0.15)]"
                    )}>
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-dash-navy group-hover:text-dash-orange transition-colors">{q.text}</h3>
                          <p className="text-[10px] font-bold text-dash-gray uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Posted {new Date(q.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-4 py-1.5 bg-dash-orange/10 text-dash-orange text-[10px] font-black uppercase rounded-xl border border-dash-orange/20 shadow-sm">
                          {q.maxMarks} Points
                        </span>
                      </div>

                      {!isSubmitted ? (
                        <div className="space-y-5">
                          <div className="relative group">
                            <textarea
                              placeholder="Type your semantic response here..."
                              rows={4}
                              className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all resize-none text-sm font-medium shadow-inner"
                              value={answers[q._id] || ""}
                              onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                            />
                            <div className="absolute right-4 bottom-4 p-2 bg-white rounded-xl shadow-sm border border-slate-100 opacity-0 group-focus-within:opacity-100 transition-opacity">
                              <Sparkles className="h-4 w-4 text-dash-orange animate-pulse" />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSubmit(q._id)}
                            disabled={submitting === q._id}
                            className="w-full py-5 bg-dash-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-navy-500/10 hover:bg-[#151c4a] transition-all hover:scale-[1.02] active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-3"
                          >
                            {submitting === q._id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Running BERT Engine...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Submit for AI Evaluation
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm gap-6">
                          <div className="flex items-center gap-5">
                            <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl ring-1 ring-emerald-100">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-lg font-black text-dash-navy">{submission.score} / {submission.maxMarks} Points</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded border border-emerald-100">
                                  {submission.verdict}
                                </span>
                                <span className="text-[10px] font-bold text-dash-gray">Mastery: {submission.percentage}%</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSubmissions(submissions.filter(s => (s.question._id || s.question) !== q._id));
                              setAnswers({ ...answers, [q._id]: submission.answer });
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-dash-gray rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-dash-orange hover:text-white transition-all shadow-sm"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Retake Attempt
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-8">
          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40">
            <h2 className="text-xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-dash-purple" />
              Academic Growth
            </h2>
            <div className="space-y-8">
              {[
                { label: "Semantic Accuracy", value: 85, color: "bg-dash-orange" },
                { label: "Keyword Mastery", value: 92, color: "bg-dash-purple" },
                { label: "Completion Rate", value: 70, color: "bg-dash-cyan" },
              ].map((task, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-dash-gray">{task.label}</span>
                    <span className="text-dash-navy">{task.value}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000 shadow-sm", task.color)}
                      style={{ width: `${task.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40">
            <h2 className="text-xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <Award className="h-5 w-5 text-dash-cyan" />
              Elite History
            </h2>
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <p className="text-xs font-bold text-dash-gray italic text-center py-4">No evaluations yet.</p>
              ) : (
                submissions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer group">
                    <div className="p-3 bg-dash-purple/10 rounded-2xl group-hover:bg-dash-purple/20 transition-colors">
                      <Sparkles className="h-5 w-5 text-dash-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-dash-navy truncate group-hover:text-dash-purple transition-colors">{s.question?.text || "Assignment"}</p>
                      <p className="text-[10px] font-bold text-dash-gray uppercase tracking-widest">{s.verdict}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-dash-purple">{s.percentage}%</span>
                      <p className="text-[8px] font-bold text-dash-gray uppercase">Final</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {submissions.length > 3 && (
              <button className="w-full mt-6 py-3 border border-slate-100 text-dash-gray text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                View All Results
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
