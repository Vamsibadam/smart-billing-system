import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  Menu,
  RotateCcw,
} from "lucide-react";

function MainLayout({ children }) {
  const [posMode, setPosMode] = useState(
    localStorage.getItem("pos_mode") === "true"
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isShortLandscape, setIsShortLandscape] = useState(false);

  const location = useLocation();
  const scrollContainerRef = useRef(null);

  // Detect short landscape (phones rotated sideways)
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isShort = window.innerHeight < 550; // Typical phone height in landscape
      setIsShortLandscape(isLandscape && isShort);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  useEffect(() => {
    const handlePosModeChange = () => {
      setPosMode(localStorage.getItem("pos_mode") === "true");
    };

    window.addEventListener("pos-mode-change", handlePosModeChange);
    return () => {
      window.removeEventListener("pos-mode-change", handlePosModeChange);
    };
  }, []);

  const handleContainerScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    window.dispatchEvent(
      new CustomEvent("layout-scroll", { detail: { scrollTop } })
    );
  };

  const closeMenuSmoothly = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 220);
  };

  const isBillingActive = location.pathname === "/billing";

  // Desktop sidebar should ONLY show if width >= 768px AND height >= 550px (tablets/laptops/PCs)
  const showDesktopSidebar = !posMode && !isShortLandscape;

  return (
    <div className="h-screen w-full overflow-hidden antialiased bg-[#F4F5F8]">
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
          from { transform: translate3d(0, 100%, 0); opacity: 0.8; }
          to { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes traySlideDown {
          from { transform: translate3d(0, 0, 0); opacity: 1; }
          to { transform: translate3d(0, 100%, 0); opacity: 0; }
        }
        .tray-open-anim { animation: traySlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tray-close-anim { animation: traySlideDown 0.22s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .ios-spring { transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease; }
        .ios-fab-anim { animation: iosFabPulse 3.5s ease-in-out infinite; }
      `}</style>

      {/* =====================================================
          LANDSCAPE PHONE OVERLAY NOTICE
      ====================================================== */}
      {isShortLandscape && (
        <div className="fixed top-2 right-3 z-[9999] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/20 shadow-lg flex items-center gap-1.5 pointer-events-none">
          <RotateCcw size={12} className="text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Rotate to portrait for best experience</span>
        </div>
      )}

      {/* =====================================================
          DESKTOP & TABLET SIDEBAR (Hidden on landscape phones)
      ====================================================== */}
      {showDesktopSidebar && (
        <aside className="fixed left-0 top-0 z-40 hidden md:block w-64 lg:w-72 xl:w-80 h-screen">
          <Sidebar />
        </aside>
      )}

      {/* =====================================================
          MAIN APPLICATION VIEWPORT
      ====================================================== */}
      <div
        className={`flex h-screen flex-col transition-all duration-200 ${
          showDesktopSidebar ? "md:ml-64 lg:ml-72 xl:ml-80" : "ml-0"
        }`}
      >
        {/* Top Navbar */}
        {showDesktopSidebar && (
          <header className="relative z-30 flex-shrink-0 px-2 pt-2 sm:px-4 sm:pt-4">
            <Navbar />
          </header>
        )}

        {/* Content Viewport */}
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <div
            id="main-scroll-container"
            ref={scrollContainerRef}
            onScroll={handleContainerScroll}
            className={`relative h-full w-full overflow-x-hidden overflow-y-auto scrollbar-none ${
              posMode ? "bg-white" : "bg-[#F4F5F8]"
            }`}
          >
            <div
              className={`relative z-10 w-full min-w-0 ${
                isShortLandscape ? "pb-20" : "pb-32 md:pb-6"
              } ${posMode ? "p-2 sm:p-4" : "p-0"}`}
            >
              {children}
            </div>
          </div>
        </main>

        {/* =====================================================
            MOBILE / LANDSCAPE GLASS BAR
        ====================================================== */}
        {!posMode && (
          <div
            className={`${
              showDesktopSidebar ? "md:hidden" : "flex"
            } fixed bottom-3 inset-x-0 z-40 px-3 flex justify-center pointer-events-none`}
          >
            <nav
              className={`pointer-events-auto relative flex items-center justify-between gap-1.5 w-full max-w-[400px] ${
                isShortLandscape ? "h-[54px] px-3 rounded-[24px]" : "h-[70px] px-2.5 rounded-[34px]"
              } bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.45)]`}
            >
              {/* TAB 1: DASHBOARD */}
              <Link
                to="/dashboard"
                className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <LayoutDashboard
                  size={isShortLandscape ? 17 : 21}
                  className={location.pathname === "/dashboard" ? "text-orange-400" : "text-slate-400"}
                />
                {!isShortLandscape && (
                  <span className={`text-[9.5px] font-black mt-0.5 ${location.pathname === "/dashboard" ? "text-white" : "text-slate-400"}`}>
                    Dashboard
                  </span>
                )}
              </Link>

              {/* TAB 2: PRODUCTS */}
              <Link
                to="/products"
                className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <Package
                  size={isShortLandscape ? 17 : 21}
                  className={location.pathname === "/products" ? "text-orange-400" : "text-slate-400"}
                />
                {!isShortLandscape && (
                  <span className={`text-[9.5px] font-black mt-0.5 ${location.pathname === "/products" ? "text-white" : "text-slate-400"}`}>
                    Products
                  </span>
                )}
              </Link>

              {/* CENTER FAB: BILLING */}
              <Link
                to="/billing"
                className={`relative ${
                  isShortLandscape ? "-top-3" : "-top-6"
                } flex flex-col items-center justify-center shrink-0 active:scale-[0.88] ios-spring cursor-pointer`}
              >
                <div className="p-1 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/30">
                  <div
                    className={`${
                      isShortLandscape ? "w-10 h-10" : "w-13 h-13"
                    } rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30`}
                  >
                    <Receipt size={isShortLandscape ? 18 : 22} strokeWidth={2.4} />
                  </div>
                </div>
              </Link>

              {/* TAB 3: REPORTS */}
              <Link
                to="/reports"
                className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <FileText
                  size={isShortLandscape ? 17 : 21}
                  className={location.pathname === "/reports" ? "text-orange-400" : "text-slate-400"}
                />
                {!isShortLandscape && (
                  <span className={`text-[9.5px] font-black mt-0.5 ${location.pathname === "/reports" ? "text-white" : "text-slate-400"}`}>
                    Reports
                  </span>
                )}
              </Link>

              {/* TAB 4: MENU DRAWER TRIGGER */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="group relative flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-[0.88] ios-spring cursor-pointer"
              >
                <Menu
                  size={isShortLandscape ? 17 : 21}
                  className={mobileMenuOpen ? "text-indigo-400" : "text-slate-400"}
                />
                {!isShortLandscape && (
                  <span className={`text-[9.5px] font-black mt-0.5 ${mobileMenuOpen ? "text-white" : "text-slate-400"}`}>
                    Menu
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* =====================================================
          PORTALED BOTTOM TRAY DRAWER (Works in both orientations)
      ====================================================== */}
      {!posMode &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100000] flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
              onClick={closeMenuSmoothly}
            />

            <div
              className={`relative z-10 w-full max-h-[92vh] flex flex-col ${
                isClosing ? "tray-close-anim" : "tray-open-anim"
              }`}
            >
              <Sidebar isMobileTray onNavigate={closeMenuSmoothly} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default MainLayout;