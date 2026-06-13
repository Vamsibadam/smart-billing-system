import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await login(username, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data.username);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid username or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-sans">
      
      {/* Structural Minimal Canvas Radial Ambient Glows */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[650px] h-[650px] bg-gradient-to-tr from-orange-400/5 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-bl from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 🚀 THE INNOVATIVE PARADIGM: Asymmetric Nested Card Deck */}
      <div className="w-full max-w-5xl bg-white/60 backdrop-blur-md border border-white rounded-[40px] p-6 sm:p-8 shadow-[0_4px_30px_-5px_rgba(249,115,22,0.02),0_20px_50px_-15px_rgba(99,102,241,0.04)] flex flex-col md:flex-row gap-8 relative z-10 items-stretch min-h-[580px]">
        
        {/* LEFT COLUMN PANEL: Dynamic Brand Hero Section (60% Width) */}
        <div className="w-full md:w-[58%] bg-gradient-to-br from-slate-900 to-[#121829] rounded-[32px] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-inner border border-slate-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Row Branding Node */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">
              Smart Billing System
            </h2>
          </div>

          {/* Central Hero Message Block */}
          <div className="my-auto pt-12 pb-8 relative z-10 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Frictionless retail <br />
              workflows begin here.
            </h1>
            <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-sm">
              Initialize your administrative environment to process cash transactions, oversee global warehouse parameters, and query live database telemetry streams.
            </p>
          </div>

          {/* Lower Dynamic Micro Status Block */}
          <div className="relative z-10 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>TERMINAL CONSOLE V2.0</span>
            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">SECURE SYSTEM</span>
          </div>
        </div>

        {/* RIGHT COLUMN PANEL: Form Entry Layout Area (42% Width) */}
        <div className="w-full md:w-[42%] flex flex-col justify-center p-4 sm:p-6 relative z-10">
          
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-normal text-slate-800">
              Gateway Access
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              Verify Administrative Keys
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Workspace identifier"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3.5 text-sm font-medium placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Master passkey code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3.5 text-sm font-medium placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-bold tracking-wide py-3.5 rounded-xl text-sm shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Syncing Passkeys...</span>
                </>
              ) : (
                <>
                  <span>Initialize Dashboard</span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;
