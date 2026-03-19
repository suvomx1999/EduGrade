import { useState, useEffect } from "react";
import api from "../utils/api";
import DashboardLayout from "../components/DashboardLayout";
import { PlusCircle, FileText, Trash2, ChevronDown, BookOpen, CheckCircle2, Target, Zap, Users, Clock, Calendar, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MyQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    text: "",
    modelAnswer: "",
    keywords: "",
    maxMarks: 10,
    dueDate: "",
    duration: 30,
  });
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

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
      setFormData({ text: "", modelAnswer: "", keywords: "", maxMarks: 10, dueDate: "", duration: 30 });
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

  const handleGenerateAI = async () => {
    if (!aiContext || aiContext.trim().length < 50) {
      alert("Please provide at least 50 characters of context for the AI.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post("/questions/generate", { context: aiContext });
      const { question, model_answer, keywords } = response.data;
      
      setFormData({
        ...formData,
        text: question,
        modelAnswer: model_answer,
        keywords: keywords.join(", "),
      });
      
      setShowAiModal(false);
      setAiContext("");
      alert("Question generated! You can now review and publish it.");
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("AI Generation failed. Please try again with more descriptive text.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout title="My Questions" subtitle="Curriculum Content Management">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-4">
          <div className="dash-card dash-card-white p-8 sticky top-28 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-dash-orange/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-dash-navy tracking-tight flex items-center gap-3">
                <div className="p-2 bg-dash-orange/10 rounded-xl">
                  <PlusCircle className="h-6 w-6 text-dash-orange" />
                </div>
                New Assignment
              </h2>
              <button 
                onClick={() => setShowAiModal(true)}
                className="p-3 bg-dash-purple/10 text-dash-purple rounded-2xl hover:bg-dash-purple/20 transition-all group relative border border-dash-purple/20 shadow-sm"
                title="AI Assist"
              >
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dash-navy text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap uppercase tracking-widest shadow-xl">AI Generator</span>
              </button>
            </div>

            {showAiModal && (
              <div className="mb-8 p-6 bg-dash-purple/5 rounded-[2rem] border border-dash-purple/20 animate-fade-in shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-dash-purple uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    AI Content Engine
                  </h3>
                  <button onClick={() => setShowAiModal(false)} className="p-1.5 hover:bg-rose-50 rounded-lg text-dash-gray hover:text-rose-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  placeholder="Paste context here (e.g., lecture notes, paragraph)..."
                  className="w-full p-5 bg-white border-none rounded-2xl focus:ring-4 focus:ring-dash-purple/5 outline-none transition-all resize-none text-xs font-medium mb-4 shadow-sm"
                  rows={4}
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                />
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full py-4 bg-dash-purple text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-slate-300 flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Assignment
                    </>
                  )}
                </button>
              </div>
            )}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all text-sm font-bold shadow-inner"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Clock className="h-3 w-3" />
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-dash-orange/5 outline-none transition-all text-sm font-black shadow-inner"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-dash-orange text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                Publish to Students
              </button>
            </form>
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="dash-card dash-card-white p-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl shadow-dash-purple/5">
            <h2 className="text-2xl font-black text-dash-navy tracking-tight mb-8 flex items-center gap-3">
              <div className="p-2 bg-dash-purple/10 rounded-xl">
                <FileText className="h-6 w-6 text-dash-purple" />
              </div>
              Published Repository
            </h2>
            <div className="space-y-6">
              {loading ? (
                <div className="p-20 text-center animate-pulse">
                  <div className="h-12 w-12 bg-slate-100 rounded-full mx-auto mb-4"></div>
                  <p className="text-dash-gray font-black uppercase tracking-widest text-[10px]">Syncing with Cloud...</p>
                </div>
              ) : questions.length === 0 ? (
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
                          <span className="px-4 py-1.5 bg-slate-50 text-dash-gray text-[10px] font-black uppercase rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-dash-purple/60" />
                            {q.dueDate ? new Date(q.dueDate).toLocaleString() : "No Deadline"}
                          </span>
                          <span className="px-4 py-1.5 bg-slate-50 text-dash-gray text-[10px] font-black uppercase rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-dash-purple/60" />
                            {q.duration || 30} MIN
                          </span>
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
                            Student Evaluations
                          </h4>
                          <span className="px-3 py-1 bg-dash-purple/5 text-dash-purple text-[10px] font-black rounded-lg border border-dash-purple/10">
                            {submissions[q._id]?.length || 0} Total Attempts
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
                                    {sub.plagiarismFlag && (
                                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-lg shadow-lg animate-bounce">
                                        <AlertCircle className="h-3 w-3" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-black text-dash-navy group-hover/item:text-dash-purple transition-colors">{sub.student.name}</p>
                                      {sub.plagiarismFlag && (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded border border-rose-100">Plagiarism</span>
                                      )}
                                    </div>
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

export default MyQuestions;
