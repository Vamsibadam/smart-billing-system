import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  Menu,
} from "lucide-react";

function MainLayout({ children }) {
  const [posMode, setPosMode] = useState(
    localStorage.getItem("pos_mode") === "true"
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handlePosModeChange = () => {
      setPosMode(localStorage.getItem("pos_mode") === "true");
    };

    window.addEventListener("pos-mode-change", handlePosModeChange);
    return () => {
      window.removeEventListener("pos-mode-change", handlePosModeChange);
    };
  }, []);

  const closeMenuSmoothly = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 220);
  };

  const isBillingActive = location.pathname === "/billing";

  return (
    <div
      className="
        h-screen
        w-full
        overflow-hidden
        antialiased
        bg-[#F4F5F8]
      "
    >
      {/* =====================================================
          IOS HARDWARE ACCELERATED ANIMATIONS
      ====================================================== */}
      <style>{`
        @keyframes iosFabPulse {
          0%, 100% {
            transform: scale3d(1, 1, 1);
            box-shadow: 0 8px 24px rgba(249, 115, 22, 0.45);
          }
          50% {
            transform: scale3d(1.035, 1.035, 1);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.55), 0 0 16px rgba(249, 115, 22, 0.4);
          }
        }

        @keyframes traySlideUp {
          from {
            transform: translate3d(0, 100%, 0);
            opacity: 0.8;
          }
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }
        @keyframes traySlideDown {
          from {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
          to {
            transform: translate3d(0, 100%, 0);
            opacity: 0;
          }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .tray-open-anim {
          animation: traySlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .tray-close-anim {
          animation: traySlideDown 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
          will-change: transform, opacity;
        }
        .overlay-open-anim {
          animation: overlayFadeIn 0.25s ease-out forwards;
        }
        .overlay-close-anim {
          animation: overlayFadeOut 0.22s ease-in forwards;
        }

        .ios-spring {
          transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease;
          will-change: transform;
        }
        .ios-fab-anim {
          animation: iosFabPulse 3.5s ease-in-out infinite;
          will-change: transform, box-shadow;
        }
      `}</style>

      {/* =====================================================
          DESKTOP SIDEBAR (100% UNTOUCHED)
      ====================================================== */}
      {!posMode && (
        <aside
          className="
            fixed
            left-0
            top-0
            z-40
            hidden
            md:block
            w-80
            h-screen
          "
        >
          <Sidebar />
        </aside>
      )}

      {/* =====================================================
          MOBILE BOTTOM SHEET TRAY
      ====================================================== */}
      {!posMode && mobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] md:hidden">
          <div
            className={`
              absolute
              inset-0
              bg-slate-950/65
              backdrop-blur-sm
              ${isClosing ? "overlay-close-anim" : "overlay-open-anim"}
            `}
            onClick={closeMenuSmoothly}
          />

          <div
            className={`
              absolute
              bottom-0
              inset-x-0
              z-[9999]
              max-h-[85vh]
              w-full
              flex
              flex-col
              ${isClosing ? "tray-close-anim" : "tray-open-anim"}
            `}
          >
            <Sidebar isMobileTray onNavigate={closeMenuSmoothly} />
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}
      <div
        className={`
          flex
          h-screen
          flex-col
          ${!posMode ? "md:ml-80" : ""}
        `}
      >
        {/* Navbar */}
        {!posMode && (
          <div
            className="
              relative
              z-30
              flex-shrink-0
              px-2
              pt-2
              sm:px-4
              sm:pt-4
            "
          >
            <Navbar />
          </div>
        )}

        {/* Content Area */}
        <main
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <div
            className={`
              relative
              h-full
              w-full
              overflow-x-hidden
              overflow-y-auto
              scrollbar-none
              ${posMode ? "bg-white" : "bg-[#F4F5F8]"}
            `}
          >
            <div
              className={`
                relative
                z-10
                w-full
                min-w-0
                pb-28
                md:pb-0
                ${posMode ? "p-2 sm:p-4" : "p-0"}
              `}
            >
              {children}
            </div>
          </div>
        </main>

        {/* =====================================================
            MOBILE IOS GLASS FOOTER CAPSULE WITH SPRING DYNAMICS
        ====================================================== */}
        {!posMode && (
          <div className="md:hidden fixed bottom-4 inset-x-0 z-40 px-3 flex justify-center pointer-events-none">
            <div
              className="
                pointer-events-auto
                relative
                flex
                items-center
                justify-between
                gap-1.5
                w-full
                max-w-[395px]
                h-[70px]
                px-2.5
                bg-slate-900/60
                backdrop-blur-2xl
                border
                border-white/20
                rounded-[34px]
                shadow-[0_20px_45px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)]
              "
            >
              {/* Internal Glass Highlights */}
              <div className="absolute top-0 left-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              <div className="absolute -bottom-6 left-1/3 w-32 h-10 bg-indigo-500/25 blur-2xl pointer-events-none" />

              {/* TAB 1: DASHBOARD */}
              {(() => {
                const isActive = location.pathname === "/dashboard";
                return (
                  <Link
                    to="/dashboard"
                    className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
                  >
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-white/15 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.35)] scale-105"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <LayoutDashboard
                        size={21}
                        className={`transition-transform duration-300 group-active:scale-90 ${
                          isActive ? "stroke-[2.4]" : "stroke-[2]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9.5px] font-black tracking-tight mt-0.5 transition-all duration-200 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Dashboard
                    </span>
                  </Link>
                );
              })()}

              {/* TAB 2: PRODUCTS */}
              {(() => {
                const isActive = location.pathname === "/products";
                return (
                  <Link
                    to="/products"
                    className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
                  >
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-white/15 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.35)] scale-105"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <Package
                        size={21}
                        className={`transition-transform duration-300 group-active:scale-90 ${
                          isActive ? "stroke-[2.4]" : "stroke-[2]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9.5px] font-black tracking-tight mt-0.5 transition-all duration-200 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Products
                    </span>
                  </Link>
                );
              })()}

              {/* CENTER FAB: BILLING (Spring Floating Action Button) */}
              <Link
                to="/billing"
                className="relative -top-6 flex flex-col items-center justify-center shrink-0 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <div
                  className={`relative p-1.5 rounded-full backdrop-blur-xl border border-white/30 transition-all duration-300 ${
                    isBillingActive
                      ? "bg-slate-900/60 shadow-[0_12px_28px_rgba(249,115,22,0.5)] scale-110"
                      : "bg-slate-900/40 shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <div
                    className={`w-13 h-13 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 flex items-center justify-center text-white ${
                      !isBillingActive ? "ios-fab-anim" : "shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                    }`}
                  >
                    <Receipt
                      size={22}
                      strokeWidth={2.6}
                      className="drop-shadow-sm"
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black tracking-tight mt-1 transition-colors ${
                    isBillingActive ? "text-orange-500 font-extrabold" : "text-slate-700"
                  }`}
                >
                  Billing
                </span>
              </Link>

              {/* TAB 3: REPORTS */}
              {(() => {
                const isActive = location.pathname === "/reports";
                return (
                  <Link
                    to="/reports"
                    className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
                  >
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-white/15 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.35)] scale-105"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <FileText
                        size={21}
                        className={`transition-transform duration-300 group-active:scale-90 ${
                          isActive ? "stroke-[2.4]" : "stroke-[2]"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9.5px] font-black tracking-tight mt-0.5 transition-all duration-200 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Reports
                    </span>
                  </Link>
                );
              })()}

              {/* TAB 4: MENU DRAWER TRIGGER */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                    mobileMenuOpen
                      ? "bg-white/15 text-indigo-400 scale-105"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Menu
                    size={21}
                    className="transition-transform duration-300 group-active:scale-90 stroke-[2.2]"
                  />
                </div>
                <span
                  className={`text-[9.5px] font-black tracking-tight mt-0.5 transition-all duration-200 ${
                    mobileMenuOpen ? "text-white" : "text-slate-400"
                  }`}
                >
                  Menu
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainLayout;