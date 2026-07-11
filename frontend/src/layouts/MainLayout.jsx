import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {

  const [posMode, setPosMode] = useState(
    localStorage.getItem("pos_mode") === "true"
  );

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

    <div className="h-screen w-full bg-slate-100 overflow-hidden flex antialiased">

      <div className="flex w-full h-full overflow-hidden relative">

        {!posMode && (

          <div className="h-full flex-shrink-0">

            <Sidebar />

          </div>

        )}

        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">

          {!posMode && (

            <Navbar />

          )}

          <main
            className={`
            flex-1
            min-h-0
            overflow-hidden
            ${
              posMode
                ? ""
                : "px-4 pb-4"
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
                    rounded-[32px]
                    border
                    border-white/80
                    shadow-[0_4px_25px_-5px_rgba(249,115,22,0.04),0_16px_40px_-15px_rgba(0,0,0,0.06)]
                  `
              }
              `}
            >

              {!posMode && (

                <>

                  <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-tr from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-bl from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                </>

              )}

              <div
                className={`
                relative
                z-10
                w-full
                max-w-full
                overflow-x-hidden
                ${
                  posMode
                    ? "p-4"
                    : "p-6"
                }
                `}
              >

                {children}

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>

  );

}

export default MainLayout;