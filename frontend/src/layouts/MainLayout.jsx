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
        bg-slate-100
        antialiased
        overflow-hidden
      "
    >

      {/* =====================================================
          FIXED DESKTOP SIDEBAR
      ===================================================== */}

      {!posMode && (

        <aside
          className="
            hidden
            md:block

            fixed
            left-0
            top-0

            w-80
            h-screen

            z-40
          "
        >

          <Sidebar />

        </aside>

      )}


      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {!posMode && mobileMenuOpen && (

        <div
          className="
            fixed
            inset-0
            z-[9998]
            md:hidden
          "
        >

          {/* Overlay */}

          <div
            className="
              absolute
              inset-0
              bg-black/40
              backdrop-blur-sm
            "
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />


          {/* Sidebar */}

          <div
            className="
              absolute
              left-0
              top-0

              h-full

              w-[300px]
              max-w-[90vw]

              z-[9999]
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
          MAIN APPLICATION AREA
      ===================================================== */}

      <div
        className={`
          h-screen

          flex
          flex-col

          ${
            !posMode
              ? "md:ml-80"
              : ""
          }
        `}
      >


        {/* ===================================================
            FIXED NAVBAR
        =================================================== */}

        {!posMode && (

          <div
            className="
              flex-shrink-0
              relative
              z-30
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
            SCROLLABLE PAGE AREA
        =================================================== */}

        <main
          className={`
            flex-1
            min-h-0
            min-w-0

            ${
              posMode
                ? ""
                : "px-2 sm:px-3 md:px-4 pb-2 md:pb-4"
            }
          `}
        >

          <div
            className={`
              w-full
              h-full

              relative

              overflow-y-auto
              overflow-x-hidden

              scrollbar-none

              ${
                posMode

                  ? "bg-white"

                  : `
                    bg-gradient-to-tr
                    from-orange-100/40
                    via-slate-50
                    to-indigo-50/60

                    backdrop-blur-md

                    rounded-2xl
                    sm:rounded-3xl

                    border
                    border-white/80

                    shadow-[0_4px_25px_-5px_rgba(249,115,22,0.04),0_16px_40px_-15px_rgba(0,0,0,0.06)]
                  `
              }
            `}
          >

            {/* =================================================
                BACKGROUND EFFECTS
            ================================================= */}

            {!posMode && (

              <>

                <div
                  className="
                    absolute
                    bottom-[-10%]
                    left-[-5%]

                    w-72
                    h-72

                    sm:w-96
                    sm:h-96

                    bg-gradient-to-tr
                    from-amber-400/10
                    via-orange-400/5
                    to-transparent

                    rounded-full
                    blur-3xl

                    pointer-events-none
                  "
                />


                <div
                  className="
                    absolute
                    top-[-10%]
                    right-[-5%]

                    w-72
                    h-72

                    sm:w-96
                    sm:h-96

                    bg-gradient-to-bl
                    from-indigo-500/5
                    via-purple-500/5
                    to-transparent

                    rounded-full
                    blur-3xl

                    pointer-events-none
                  "
                />

              </>

            )}


            {/* =================================================
                PAGE CONTENT
            ================================================= */}

            <div
              className={`
                relative
                z-10

                w-full
                max-w-full
                min-w-0

                ${
                  posMode
                    ? "p-2 sm:p-4"
                    : "p-3 sm:p-4 md:p-6"
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