import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


function MainLayout({ children }) {
  return (
    
    <div className="h-screen w-full bg-slate-100 overflow-hidden flex antialiased">
      {/* Master Flex Layer Container */}
      <div className="flex w-full h-full max-w-full overflow-hidden relative">
        
        {/* Left Floating Sidebar Panel */}
        <div className="h-full flex-shrink-0">
          <Sidebar />
        </div>

        {/* Right Station Column Frame */}
        <div className="flex flex-col flex-1 h-full min-w-0 max-w-full overflow-hidden">
          
          {/* Top Floating Island Header */}
          <Navbar />

          {/* Curved Island Content Area */}
          <main className="flex-1 px-4 pb-4 min-h-0 max-w-full overflow-hidden">
            <div 
              className="
              w-full 
              h-full 
              bg-gradient-to-tr from-orange-100/40 via-slate-50 to-indigo-50/60
              backdrop-blur-md
              rounded-[32px] 
              border border-white/80 
              shadow-[0_4px_25px_-5px_rgba(249,115,22,0.04),0_16px_40px_-15px_rgba(0,0,0,0.06)]
              relative 
              /* FIXED: overflow-y-auto enables smooth up/down scrolling, while overflow-x-hidden bars side-scroll */
              overflow-y-auto
              overflow-x-hidden
              scrollbar-none
              "
            >
              {/* Internal abstract gradient light mesh decorations */}
              <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-tr from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-bl from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Workstation dashboard container inject point */}
              <div className="relative z-10 w-full p-6 max-w-full overflow-x-hidden">
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
