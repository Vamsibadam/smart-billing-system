import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  const [posMode, setPosMode] = useState(
    localStorage.getItem("pos_mode") === "true"
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePosModeChange = () => {
      setPosMode(
        localStorage.getItem("pos_mode") === "true"
      );
    };

    window.addEventListener(
      "pos-mode-change",
      handlePosModeChange
    );

    return () => {
      window.removeEventListener(
        "pos-mode-change",
        handlePosModeChange
      );
    };
  }, []);

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
          DESKTOP SIDEBAR
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
          MOBILE SIDEBAR
      ====================================================== */}

      {!posMode && mobileMenuOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9998]
            md:hidden
          "
        >

          {/* =================================================
              MOBILE OVERLAY

              No backdrop blur here.
              This keeps the dashboard behind the menu sharp.
          ================================================== */}

          <div
            className="
              absolute
              inset-0

              bg-slate-950/55

              transition-opacity
              duration-200
            "
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />


          {/* =================================================
              MOBILE SIDEBAR
          ================================================== */}

          <div
            className="
              absolute
              left-0
              top-0

              z-[9999]

              h-full
              w-[300px]
              max-w-[88vw]

           

              

              animate-[slideIn_0.2s_ease-out]
            "
          >
            <Sidebar
              onNavigate={() =>
                setMobileMenuOpen(false)
              }
            />
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

          ${
            !posMode
              ? "md:ml-80"
              : ""
          }
        `}
      >

        {/* ===================================================
            NAVBAR
        =================================================== */}

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
            <Navbar
              onMenuClick={() =>
                setMobileMenuOpen(true)
              }
            />
          </div>
        )}


        {/* ===================================================
            CONTENT AREA
        =================================================== */}

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

              ${
                posMode
                  ? "bg-white"
                  : "bg-[#F4F5F8]"
              }
            `}
          >

            {/* =================================================
                PAGE CONTENT
            ================================================== */}

            <div
              className={`
                relative
                z-10

                w-full
                min-w-0

                ${
                  posMode
                    ? "p-2 sm:p-4"
                    : "p-0"
                }
              `}
            >
              {children}
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default MainLayout;