import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  FileText,
  History,
  Settings,
  UtensilsCrossed,
  Megaphone,
  X,
  User,
} from "lucide-react";

function Sidebar({ onNavigate, isMobileTray }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Operator_01";

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Billing", path: "/billing", icon: Receipt },
    { name: "Bill History", path: "/bill-history", icon: History },
    { name: "Products", path: "/products", icon: Package },
    { name: "Ingredients", path: "/ingredients", icon: UtensilsCrossed },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Engagement", path: "/engagement", icon: Megaphone },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  /* =========================================================
      MOBILE / TABLET BOTTOM TRAY MODAL
  ========================================================== */
  if (isMobileTray) {
    return (
      <div
        className="
          relative
          w-full
          max-w-2xl
          mx-auto
          rounded-t-[32px] sm:rounded-t-[40px]
          bg-slate-900/95
          backdrop-blur-2xl
          border-t border-x border-white/20
          px-4 sm:px-6
          pt-3
          pb-6 sm:pb-8
          shadow-[0_-20px_60px_rgba(0,0,0,0.6)]
          flex flex-col gap-3.5 sm:gap-4
          text-white
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Pull Handle */}
        <div
          onClick={onNavigate}
          className="mx-auto w-10 sm:w-12 h-1.5 rounded-full bg-white/30 shrink-0 cursor-pointer hover:bg-white/50 transition-colors"
        />

        {/* Top Header Card */}
        <div className="relative z-10 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <User size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Signed in as
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white max-w-[200px] truncate">
                {username}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Touch Grid: 3 cols on phones, 4-5 cols on tablets */}
        <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto py-1 scrollbar-none">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onNavigate}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 text-center ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-indigo-600 border-white/30 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/[0.06] border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mb-1 sm:mb-1.5 ${
                    isActive ? "bg-white/20 text-white" : "text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10.5px] sm:text-xs font-bold tracking-tight line-clamp-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="relative z-10 pt-1">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-900/30 active:scale-95 transition cursor-pointer"
          >
            <span>Terminate Session</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
      ADAPTIVE DESKTOP & TABLET SIDEBAR
  ========================================================== */
  return (
    <aside
      className="
        h-screen
        p-2 sm:p-3 lg:p-4
        flex
        relative
        overflow-hidden
        bg-transparent
        select-none
        shrink-0
      "
    >
      <div
        className="
          w-56 md:w-60 lg:w-68 xl:w-72
          h-full
          bg-gradient-to-b from-slate-900 via-[#0F172A] to-slate-900
          rounded-2xl md:rounded-[28px] lg:rounded-[32px]
          border border-slate-800/80
          shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3),0_16px_40px_-15px_rgba(0,0,0,0.5)]
          flex flex-col justify-between
          p-3 md:p-4 lg:p-5
          relative
          z-10
          overflow-hidden
        "
      >
        {/* Ambient Effects */}
        <div
          className="
            absolute
            bottom-[-10px]
            left-[-10px]
            w-32 md:w-36
            h-32 md:h-36
            bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent
            rounded-full
            blur-2xl
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            top-0
            right-0
            w-24 md:w-28
            h-24 md:h-28
            bg-gradient-to-bl from-indigo-500/10 to-transparent
            rounded-full
            blur-xl
            pointer-events-none
          "
        />

        {/* Top Branding Section */}
        <div className="relative z-10 shrink-0">
          <div
            className="
              px-2.5 md:px-3 lg:px-4
              py-3 md:py-4 lg:py-5
              mb-3 md:mb-4 lg:mb-6
              flex items-center gap-2.5 md:gap-3 lg:gap-4
              border-b border-slate-800/40
            "
          >
            <div
              className="
                w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11
                rounded-xl md:rounded-2xl
                bg-gradient-to-tr from-orange-500 to-indigo-500
                flex items-center justify-center
                shadow-md shadow-indigo-900/50
                shrink-0
              "
            >
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white/90 shadow-xs" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-black tracking-tight text-slate-100 truncate">
                MENU
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                Operator Panel
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu (Adapts to any height) */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none space-y-1 md:space-y-1.5 pr-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (onNavigate) onNavigate();
                }}
                className={`
                  flex items-center gap-2.5 md:gap-3.5 lg:gap-4
                  px-3 md:px-4 lg:px-5
                  py-2.5 md:py-3 lg:py-3.5
                  rounded-xl md:rounded-2xl
                  text-xs md:text-sm font-bold tracking-wide
                  transition-all duration-200
                  group relative
                  ${
                    isActive
                      ? "bg-slate-800/90 text-white border border-slate-700/50 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.2)]"
                      : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }
                `}
              >
                {/* Active Indicator Beacon */}
                {isActive && (
                  <div className="absolute right-3 md:right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
                )}

                {/* Icon */}
                <div
                  className={`transition-all duration-200 group-hover:scale-105 shrink-0 ${
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-500 group-hover:text-orange-400"
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />
                </div>

                {/* Title */}
                <span className="truncate transition-colors duration-200">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Session / Logout Deck */}
        <div className="relative z-10 shrink-0 pt-3 md:pt-4 mt-2 border-t border-slate-800/40">
          <div
            className="
              p-2.5 md:p-3 lg:p-4
              bg-slate-950/80
              border border-slate-800/60
              rounded-xl md:rounded-2xl
              flex items-center justify-between
              shadow-inner
            "
          >
            <button
              type="button"
              onClick={logout}
              className="
                flex-1
                inline-flex items-center justify-center gap-1.5 md:gap-2
                bg-gradient-to-r from-red-500 to-rose-600
                text-white
                px-2.5 md:px-3 lg:px-4
                py-2 md:py-2.5
                rounded-xl md:rounded-2xl
                text-[11px] md:text-xs font-bold
                shadow-sm shadow-red-500/10
                hover:opacity-95 hover:scale-[1.01] active:scale-95
                transition-all duration-200
                cursor-pointer
                truncate
              "
            >
              <span>Term Session</span>
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>

            <span className="ml-2.5 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;