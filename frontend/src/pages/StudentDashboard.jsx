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
  FileText,
  FileUp,
  Trophy,
  Zap,
  Bird,
  Flame,
  X
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Badge Icon Mapping
const BadgeIcon = ({ name, className }) => {
  switch (name) {
    case "Trophy": return <Trophy className={className} />;
    case "Zap": return <Zap className={className} />;
    case "Bird": return <Bird className={className} />;
    case "Flame": return <Flame className={className} />;
    default: return <Award className={className} />;
  }
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [isExtracting, setIsExtracting] = useState(null);
  const [answers, setAnswers] = useState({});
  const [earnedBadge, setEarnedBadge] = useState(null);

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

  const handleHandwrittenUpload = async (e, questionId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsExtracting(questionId);
    try {
      const response = await api.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setAnswers({ ...answers, [questionId]: response.data.text });
      alert("Handwritten text extracted! You can now review and submit.");
    } catch (error) {
      console.error("OCR failed", error);
      alert("Failed to extract text from photo. Please ensure the image is clear.");
    } finally {
      setIsExtracting(null);
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
      const response = await api.post("/submissions", { questionId, answer });
      if (response.data.newBadge) {
        setEarnedBadge(response.data.newBadge);
      }
      await fetchData();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setSubmitting(null);
    }
  };

  const getSubmissionForQuestion = (questionId) => {
    return submissions.find((s) => {
      const qId = s.question?._id || s.question;
      return qId === questionId;
    });
  };

  const calculateAnalytics = () => {
    if (submissions.length === 0) return { accuracy: 0, mastery: 0, completion: 0 };
    
    const accuracy = Math.round(submissions.reduce((acc, curr) => acc + (curr.semanticSimilarity || 0), 0) / submissions.length * 100);
    const mastery = Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length);
    const completion = Math.round((submissions.length / (questions.length || 1)) * 100);
    
    return { accuracy, mastery, completion };
  };

  const analytics = calculateAnalytics();

  // Prepare chart data from submissions
  const chartData = submissions
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((s, i) => ({
      name: `T${i + 1}`,
      mastery: s.percentage || 0,
      accuracy: Math.round((s.semanticSimilarity || 0) * 100),
    }));

  const stats = [
    { label: "Active Assignments", value: questions.length, icon: BookOpen, bg: "bg-dash-orange" },
    { label: "Submissions", value: submissions.length, icon: GraduationCap, bg: "bg-dash-purple" },
    { label: "Avg. Mastery", value: `${analytics.mastery}%`, icon: Users, bg: "bg-dash-cyan" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Student Workspace">
      {/* Badge Earned Notification */}
      {earnedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dash-navy/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-dash-purple/20 text-center max-w-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dash-orange via-dash-purple to-dash-cyan"></div>
            <button 
              onClick={() => setEarnedBadge(null)}
              className="absolute top-6 right-6 p-2 text-dash-gray hover:text-rose-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-8 relative inline-block">
              <div className="p-8 bg-dash-purple/10 rounded-full group-hover:scale-110 transition-transform duration-500">
                <BadgeIcon name={earnedBadge} className="h-16 w-16 text-dash-purple animate-bounce" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-dash-orange animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-dash-navy mb-2">New Badge!</h2>
            <p className="text-[11px] font-black text-dash-purple uppercase tracking-[0.2em] mb-4">{earnedBadge}</p>
            <p className="text-sm font-bold text-dash-gray leading-relaxed mb-8">
              Congratulations! You've unlocked a new achievement for your academic performance.
            </p>
            <button 
              onClick={() => setEarnedBadge(null)}
              className="w-full py-4 bg-dash-purple text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Keep Learning
            </button>
          </div>
        </div>
      )}

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
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-dash-gray uppercase tracking-widest">Your Response</p>
                            <div className="relative group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleHandwrittenUpload(e, q._id)}
                                className="hidden"
                                id={`ocr-upload-${q._id}`}
                              />
                              <label
                                htmlFor={`ocr-upload-${q._id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-dash-cyan/10 text-dash-cyan rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-dash-cyan/20 transition-all border border-dash-cyan/20"
                              >
                                {isExtracting === q._id ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-dash-cyan border-t-transparent rounded-full"></div>
                                ) : (
                                  <FileUp className="h-3 w-3" />
                                )}
                                OCR Handwritten Photo
                              </label>
                            </div>
                          </div>
                          <div className="relative group">
                            <textarea
                              placeholder="Type your semantic response here or upload a photo of your handwritten work..."
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
                              setSubmissions(submissions.filter(s => {
                                const qId = s.question?._id || s.question;
                                return qId !== q._id;
                              }));
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
          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/5">
            <h2 className="text-xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-dash-purple" />
              Mastery Trend
            </h2>
            
            <div className="h-48 w-full mb-8">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a18cd1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a18cd1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      hide={true}
                    />
                    <YAxis hide={true} domain={[0, 100]} />
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
                    <Area 
                      type="monotone" 
                      dataKey="mastery" 
                      stroke="#a18cd1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMastery)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <TrendingUp className="h-8 w-8 text-slate-200 mb-2" />
                  <p className="text-[10px] font-black text-dash-gray uppercase tracking-widest">More tasks needed for trend data</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {[
                { label: "Semantic Accuracy", value: analytics.accuracy, color: "bg-dash-orange" },
                { label: "Keyword Mastery", value: analytics.mastery, color: "bg-dash-purple" },
                { label: "Completion Rate", value: analytics.completion, color: "bg-dash-cyan" },
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

          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/5">
            <h2 className="text-xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-dash-orange" />
              Achievement Gallery
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {!user?.badges || user.badges.length === 0 ? (
                <div className="col-span-2 p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <Award className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-dash-gray uppercase tracking-widest italic">No badges earned yet.</p>
                </div>
              ) : (
                user.badges.map((badge, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-dash-purple/30 transition-all">
                    <div className="p-4 bg-dash-purple/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                      <BadgeIcon name={badge.icon} className="h-8 w-8 text-dash-purple" />
                    </div>
                    <p className="text-[10px] font-black text-dash-navy uppercase tracking-[0.1em] leading-tight mb-1">{badge.type}</p>
                    <p className="text-[8px] font-bold text-dash-gray uppercase tracking-widest">{new Date(badge.awardedAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
            
            {user?.streakCount > 0 && (
              <div className="mt-8 p-6 bg-dash-orange/5 rounded-3xl border border-dash-orange/10 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Flame className="h-6 w-6 text-dash-orange animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-dash-navy">Academic Streak</p>
                    <p className="text-[10px] font-bold text-dash-gray uppercase tracking-widest">Active Progress</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-dash-orange">{user.streakCount}</span>
                  <p className="text-[8px] font-black text-dash-gray uppercase">Tasks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
