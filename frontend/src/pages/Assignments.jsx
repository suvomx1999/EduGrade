import { useState, useEffect } from "react";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, FileText, CheckCircle2, RotateCcw, Search, Filter, Clock, Calendar, Timer, Sparkles, Send } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Assignments = () => {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [answers, setAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
    return submissions.find((s) => {
      const qId = s.question?._id || s.question;
      return qId === questionId;
    });
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Assignments" subtitle="Current Academic Tasks">
      <div className="space-y-10">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/60 backdrop-blur-xl border-white/40 p-6 rounded-[2rem] shadow-xl shadow-slate-200/20">
          <div className="relative w-full md:w-[32rem] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-dash-gray group-focus-within:text-dash-orange transition-colors" />
            <input
              type="text"
              placeholder="Search assignments by topic or keywords..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-dash-navy focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-50 text-dash-gray rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-dash-orange hover:shadow-lg transition-all border border-slate-100">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <div className="p-20 text-center animate-pulse">
              <div className="h-16 w-16 bg-slate-100 rounded-full mx-auto mb-6"></div>
              <p className="text-dash-gray font-black uppercase tracking-[0.3em] text-xs">Retrieving Assignments...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-24 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
              <BookOpen className="h-16 w-16 text-slate-200 mx-auto mb-6" />
              <p className="text-dash-gray font-black uppercase tracking-widest">No matching assignments found.</p>
              <p className="text-xs text-dash-gray/60 mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const submission = getSubmissionForQuestion(q._id);
              const isSubmitted = !!submission;

              return (
                <div key={q._id} className={cn(
                  "dash-card dash-card-white p-10 group transition-all duration-500 hover:scale-[1.01]",
                  isSubmitted ? "opacity-80 bg-white/40 border-slate-100" : "bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-slate-200/10 hover:border-dash-orange/30"
                )}>
                  <div className="flex flex-col xl:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110",
                          isSubmitted ? "bg-emerald-50 text-emerald-500" : "bg-dash-orange/10 text-dash-orange"
                        )}>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            isSubmitted ? "text-emerald-500" : "text-dash-gray"
                          )}>
                            {isSubmitted ? "Evaluation Completed" : "Action Required"}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={cn("w-2 h-2 rounded-full", isSubmitted ? "bg-emerald-500" : "bg-dash-orange animate-pulse")}></div>
                            <p className="text-[9px] font-bold text-dash-gray uppercase tracking-widest">
                              {isSubmitted ? "Results Synced" : "Pending Submission"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-dash-navy group-hover:text-dash-orange transition-colors tracking-tight leading-tight">
                        {q.text}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3">
                        <span className="px-5 py-2 bg-dash-orange/10 text-dash-orange text-[10px] font-black uppercase rounded-xl border border-dash-orange/20 shadow-sm">
                          {q.maxMarks} Points
                        </span>
                        <span className="px-5 py-2 bg-slate-50 text-dash-gray text-[10px] font-black uppercase rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-dash-orange/60" />
                          {q.dueDate ? new Date(q.dueDate).toLocaleString() : "No Deadline"}
                        </span>
                        <span className="px-5 py-2 bg-slate-50 text-dash-gray text-[10px] font-black uppercase rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                          <Timer className="h-4 w-4 text-dash-orange/60" />
                          {q.duration || 30} Minutes
                        </span>
                      </div>
                    </div>

                    <div className="w-full xl:w-[28rem] space-y-6">
                      {!isSubmitted ? (
                        <div className="space-y-6 animate-fade-in">
                          <div className="relative">
                            <textarea
                              placeholder="Draft your semantic answer here... The BERT engine will evaluate your conceptual understanding."
                              rows={5}
                              className="w-full p-6 bg-slate-50 border-none rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all resize-none text-sm font-medium shadow-inner"
                              value={answers[q._id] || ""}
                              onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                            />
                            <div className="absolute right-6 bottom-6 p-2 bg-white rounded-xl shadow-sm border border-slate-100 opacity-40 group-focus-within:opacity-100 transition-opacity">
                              <Sparkles className="h-5 w-5 text-dash-orange animate-pulse" />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSubmit(q._id)}
                            disabled={submitting === q._id}
                            className="w-full py-5 bg-dash-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-navy-500/20 hover:bg-[#151c4a] hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-300 flex items-center justify-center gap-4"
                          >
                            {submitting === q._id ? (
                              <>
                                <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                                Running AI Engine...
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
                        <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center space-y-5 animate-fade-in">
                          <div className="p-5 bg-white rounded-full shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-dash-navy">Evaluation Successful</p>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">
                              Mastery Level: {submission?.score} / {submission?.maxMarks}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              setSubmissions(submissions.filter(s => (s.question._id || s.question) !== q._id));
                              setAnswers({ ...answers, [q._id]: submission.answer });
                            }}
                            className="flex items-center gap-3 px-8 py-3 bg-white text-dash-gray rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-dash-orange hover:text-white hover:shadow-lg transition-all border border-emerald-100"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Retake Attempt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
