import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound, User, Sparkles } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-4 w-full bg-transparent">
      <div
        className="
        h-20
        bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900/90
        backdrop-blur-md
        rounded-[24px]
        border border-slate-800/80
        flex
        items-center
        justify-between
        px-8
        shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3),0_16px_40px_-15px_rgba(0,0,0,0.5)]
        relative
        z-50
        "
      >
        {/* Subtle deep ambient color glows matching the dark-mode theme profile */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none rounded-l-[24px]" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none rounded-r-[24px]" />

        {/* Branding Container */}
        <div className="flex items-center gap-3.5 group cursor-pointer relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-900/50">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">
              Smart Billing System
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Live Terminal Interface
            </p>
          </div>
        </div>

        {/* Interaction Hub */}
        <div className="flex items-center gap-4 relative z-10">
          {/* Change Password Link Pin */}
          <button
            onClick={() => navigate("/change-password")}
            className="
            inline-flex
            items-center
            gap-2
            bg-slate-800/90
            text-slate-300
            border border-slate-700/50
            px-4
            py-2.5
            rounded-2xl
            text-xs
            font-semibold
            hover:bg-slate-800
            hover:text-white
            hover:border-slate-600
            transition-all
            duration-200
            "
          >
            <KeyRound size={14} className="text-slate-400" />
            <span>Change Password</span>
          </button>

          {/* Translucent Operator Badge */}
          <div className="flex items-center gap-3 px-3.5 py-2 bg-slate-950/50 border border-slate-800/60 rounded-2xl shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User size={14} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Active Session
              </span>
              <span className="text-xs font-semibold text-slate-300 mt-1 leading-none">
                {localStorage.getItem("username") || "Operator_01"}
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800/60" />

          {/* Premium Logout Action Hub */}
          <button
            onClick={logout}
            className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-gradient-to-r from-red-500 to-rose-600
            text-white
            px-5
            py-2.5
            rounded-2xl
            text-xs
            font-bold
            shadow-sm shadow-red-500/10
            hover:opacity-95
            hover:scale-[1.01]
            transition-all
            duration-200
            "
          >
            <span>Term Session</span>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
