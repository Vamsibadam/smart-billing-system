import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  User,
  ReceiptText,
  LogOut,
  Sparkles,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Operator_01";

  return (
    <>
      {/* =====================================================
          NEXBILL ANIMATIONS
      ====================================================== */}
      <style>{`
        @keyframes nexLogoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes nexLogoGlow {
          0%, 100% { box-shadow: 0 5px 16px rgba(99,102,241,0.25); }
          50% { box-shadow: 0 7px 26px rgba(249,115,22,0.42), 0 0 18px rgba(129,140,248,0.25); }
        }
        @keyframes nexLogoShine {
          0% { transform: translateX(-180%) rotate(18deg); opacity: 0; }
          15% { opacity: 0.1; }
          35% { opacity: 0.45; }
          55% { opacity: 0; }
          100% { transform: translateX(180%) rotate(18deg); opacity: 0; }
        }
        @keyframes nexTextPulse {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0.9; transform: translateX(1px); }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .nex-logo-animation,
          .nex-logo-shine,
          .nex-text-animation {
            animation: none;
          }
        }

        /* Mobile */
        @media (max-width: 1023px) {
          .nex-logo-animation {
            animation: nexLogoFloat 3s ease-in-out infinite, nexLogoGlow 3s ease-in-out infinite;
          }
          .nex-logo-shine {
            animation: nexLogoShine 4s ease-in-out infinite;
          }
          .nex-text-animation {
            animation: nexTextPulse 3s ease-in-out infinite;
          }
        }
      `}</style>

      {/* =====================================================
          NAVBAR WRAPPER
      ====================================================== */}
      <div className="w-full">
        {/* ===================================================
            NAVBAR CONTAINER
            (Mobile: Sleek floating glass header | PC: 80px untouched)
        ==================================================== */}
        <div
          className="
            relative
            z-50
            w-full
            h-[58px]
            lg:h-20
            flex
            items-center
            justify-between
            gap-2
            px-3.5
            lg:px-8
            bg-slate-900/90
            lg:bg-gradient-to-r
            lg:from-slate-900
            lg:via-[#111827]
            lg:to-slate-900
            backdrop-blur-xl
            rounded-2xl
            lg:rounded-[24px]
            border
            border-slate-800/80
            shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)]
            overflow-hidden
          "
        >
          {/* Ambient Lights */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-28 lg:w-44 bg-gradient-to-r from-orange-500/[0.1] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-28 lg:w-44 bg-gradient-to-l from-indigo-500/[0.1] to-transparent" />

          {/* =====================================================
              LEFT SECTION: BRAND (Menu Icon Removed on Mobile)
          ====================================================== */}
          <div
            className="group relative z-10 flex flex-shrink-0 cursor-pointer items-center gap-2.5 lg:gap-3"
            onClick={() => navigate("/dashboard")}
          >
            {/* Logo */}
            <div
              className="
                nex-logo-animation
                relative
                flex
                h-9
                w-9
                lg:h-11
                lg:w-11
                flex-shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                lg:rounded-2xl
                bg-gradient-to-br
                from-orange-500
                via-amber-500
                to-indigo-500
                shadow-[0_4px_14px_rgba(99,102,241,0.25)]
                transition-transform
                duration-300
                group-hover:scale-105
              "
            >
              <div className="nex-logo-shine pointer-events-none absolute -left-1/2 top-[-30%] h-[160%] w-1/2 rotate-[18deg] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <ReceiptText size={19} className="lg:w-6 lg:h-6 relative z-10 text-white" strokeWidth={2.4} />
            </div>

            {/* Brand Title */}
            <div className="flex items-center gap-2">
              <h1 className="nex-text-animation whitespace-nowrap flex-shrink-0 text-lg lg:text-xl font-black tracking-[-0.035em] leading-none text-white">
                NexBill
              </h1>
              {/* Mobile-Only Live Beacon */}
              <span className="lg:hidden flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* =====================================================
              RIGHT SECTION: USER & ACTIONS
          ====================================================== */}
          <div className="relative z-10 flex flex-shrink-0 items-center gap-2 lg:gap-4">
            {/* Desktop Only: Change Password */}
            <button
              type="button"
              onClick={() => navigate("/change-password")}
              aria-label="Change Password"
              title="Change Password"
              className="
                hidden
                lg:flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-slate-700/50
                bg-slate-800/90
                px-4
                py-2.5
                text-xs
                font-semibold
                text-slate-300
                hover:border-slate-600
                hover:bg-slate-800
                hover:text-white
                active:scale-95
                transition-all
              "
            >
              <KeyRound size={19} className="text-slate-400" />
              <span>Change Password</span>
            </button>

            {/* User Session Badge */}
            <div
              className="
                flex
                items-center
                gap-2
                lg:gap-3
                rounded-xl
                lg:rounded-2xl
                border
                border-white/10
                bg-white/[0.05]
                px-2.5
                py-1.5
                lg:px-3.5
                lg:py-2
                shadow-inner
              "
            >
              <div className="flex h-6 w-6 lg:h-8 lg:w-8 flex-shrink-0 items-center justify-center rounded-lg lg:rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                <User size={13} className="lg:w-4 lg:h-4" />
              </div>

              <div className="flex flex-col text-left">
                <span className="hidden lg:inline text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Active Session
                </span>
                <span className="max-w-[90px] sm:max-w-[140px] truncate text-[11px] lg:text-xs font-bold text-slate-200">
                  {username}
                </span>
              </div>
            </div>

            {/* Desktop Divider */}
            <div className="hidden lg:block h-5 w-px bg-slate-800/60" />

            {/* Quick Logout Button */}
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="
                flex
                h-8
                w-8
                lg:h-auto
                lg:w-auto
                flex-shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                lg:rounded-2xl
                border
                border-red-500/25
                bg-red-500/10
                lg:bg-slate-800/90
                lg:border-slate-700/50
                lg:px-4
                lg:py-2.5
                text-xs
                font-semibold
                text-red-400
                lg:text-slate-300
                hover:bg-red-500/20
                hover:border-red-500/40
                active:scale-95
                transition-all
              "
            >
              <LogOut size={15} className="lg:w-[19px] lg:h-[19px]" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;