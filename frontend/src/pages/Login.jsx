import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { GraduationCap, Sparkles, BookOpen, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from "lucide-react";

const Login = () => {
  const { user, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isRegister 
      ? await register(formData.name, formData.email, formData.password, formData.role)
      : await login(formData.email, formData.password);

    if (!result.success) setError(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Dynamic Background with Dashboard Colors */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-dash-orange/10 rounded-full mix-blend-multiply filter blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-dash-purple/10 rounded-full mix-blend-multiply filter blur-[100px] animate-float delay-1000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-dash-cyan/10 rounded-full mix-blend-multiply filter blur-[100px] animate-float delay-2000"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1b2559_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col lg:flex-row bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(27,37,89,0.1)] border border-white/50 overflow-hidden animate-slide-in">
        
        {/* Left Side: Branding & Info (Dashboard Style) */}
        <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between bg-dash-navy relative overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Overlay to ensure readability */}
          <div className="absolute inset-0 bg-dash-navy/60 z-1"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="p-3 bg-dash-orange rounded-2xl shadow-lg shadow-orange-500/20 ring-1 ring-white/10">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">EduGrade AI</span>
            </div>

            <h2 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Mastery <br /> Through <br /> <span className="text-dash-orange">Intelligence.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed mb-12">
              Transforming evaluations with advanced NLP. Join our community of 50k+ elite learners.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="p-2 bg-dash-orange/20 rounded-lg w-fit mb-3">
                  <Sparkles className="h-5 w-5 text-dash-orange" />
                </div>
                <p className="text-white text-xs font-black uppercase tracking-widest">BERT Model</p>
                <p className="text-slate-500 text-[10px] font-bold mt-1">v2.4.1 Stable</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="p-2 bg-dash-purple/20 rounded-lg w-fit mb-3">
                  <CheckCircle2 className="h-5 w-5 text-dash-purple" />
                </div>
                <p className="text-white text-xs font-black uppercase tracking-widest">Instant Results</p>
                <p className="text-slate-500 text-[10px] font-bold mt-1">Real-time Analysis</p>
              </div>
            </div>
          </div>

          <div className="relative pt-8 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=user${i}`} className="w-8 h-8 rounded-full border-2 border-dash-navy shadow-sm" alt="" />
                ))}
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Join 50k+ Scholars</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form (Dashboard Style) */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16 bg-white/80 flex flex-col justify-center">
          <div className="mb-12">
            <div className="lg:hidden inline-flex items-center justify-center p-3 bg-dash-navy rounded-2xl shadow-xl mb-8">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-4xl font-black text-dash-navy tracking-tight mb-3">
              {isRegister ? "Join the Academy" : "Welcome Back"}
            </h3>
            <p className="text-dash-gray font-bold text-sm uppercase tracking-widest">
              {isRegister ? "Start your journey today" : "Access your secure workspace"}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 flex items-center gap-3 animate-shake shadow-sm">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest ml-1">Full Name</label>
                <div className="group relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-gray group-focus-within:text-dash-orange transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-dash-orange/20 outline-none transition-all font-bold text-dash-navy text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest ml-1">Email Address</label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-gray group-focus-within:text-dash-orange transition-colors" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-dash-orange/20 outline-none transition-all font-bold text-dash-navy text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest">Password</label>
                {!isRegister && <button type="button" className="text-[10px] font-black text-dash-orange uppercase hover:underline">Forgot?</button>}
              </div>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-gray group-focus-within:text-dash-orange transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-dash-orange/20 outline-none transition-all font-bold text-dash-navy text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dash-gray uppercase tracking-widest ml-1">Select Identity</label>
                <div className="p-1 bg-slate-100 rounded-2xl flex gap-1">
                  {["student", "teacher"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                        formData.role === role
                          ? "bg-white text-dash-navy shadow-sm"
                          : "text-dash-gray hover:text-slate-600"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-dash-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-navy-500/10 hover:bg-[#151c4a] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  {isRegister ? "Complete Enrollment" : "Enter Dashboard"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="px-6 py-2 rounded-full border border-slate-100 text-[10px] font-black text-dash-gray uppercase tracking-widest hover:bg-slate-50 hover:text-dash-navy transition-all"
            >
              {isRegister
                ? "Switch to Member Login"
                : "Request New Access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
