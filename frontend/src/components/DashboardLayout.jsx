import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Bell, Search, Sun, Moon } from "lucide-react";

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f7fe] relative overflow-hidden">
      {/* Dynamic Background Elements (Login Style) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-dash-orange/5 rounded-full mix-blend-multiply filter blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-dash-purple/5 rounded-full mix-blend-multiply filter blur-[100px] animate-float delay-1000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-dash-cyan/5 rounded-full mix-blend-multiply filter blur-[100px] animate-float delay-2000"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1b2559_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <Sidebar />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="px-8 py-6 flex justify-between items-start sticky top-0 bg-[#f4f7fe]/80 backdrop-blur-md z-30">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black text-dash-navy tracking-tight">{title}</h1>
            <p className="text-sm font-bold text-dash-gray mt-1">{subtitle || "Evaluation Platform"}</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="relative group px-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-gray group-focus-within:text-dash-orange transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-[#f4f7fe] border-none rounded-2xl text-sm font-bold text-dash-navy focus:ring-2 focus:ring-dash-orange/10 w-48 lg:w-64 outline-none transition-all"
              />
            </div>
            
            <button className="p-2 text-dash-gray hover:text-dash-orange hover:bg-orange-50 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-dash-gray hover:text-dash-orange hover:bg-orange-50 rounded-xl transition-all">
              <Sun className="h-5 w-5" />
            </button>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
            
            <div className="flex items-center gap-3 pr-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=ff9a8b&color=fff`}
                alt={user?.name}
                className="h-8 w-8 rounded-full object-cover shadow-sm ring-2 ring-orange-50"
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-8 pb-12 flex-1 animate-fade-in delay-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
