import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { LogOut} from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  FileText,
  History,
  Settings,
  UtensilsCrossed 
  
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const navigate = useNavigate();
 const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  

 
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Billing", path: "/billing", icon: <Receipt size={22} /> },
    { name: "Bill History", path: "/bill-history", icon: <History size={22} /> },
    { name: "Products", path: "/products", icon: <Package size={22} /> },
    { name: "Ingredients", path: "/ingredients", icon: <UtensilsCrossed  size={22} /> },
    { name: "Inventory", path: "/inventory", icon: <Boxes size={22} /> },
    { name: "Reports", path: "/reports", icon: <FileText size={22} /> },
    { name: "Store Settings", path: "/settings", icon: <Settings size={22} /> },
  ];

  return (
    /* Changed bg-slate-950 to bg-transparent so it does not take over your entire dashboard page */
    <div className="p-4 min-h-screen flex relative overflow-hidden bg-transparent">
      
      {/* Curved Menu Container Card */}
      <div 
        className="
        w-72 
        bg-gradient-to-b from-slate-900 via-[#0F172A] to-slate-900/90
        backdrop-blur-xl 
        rounded-[32px] 
        border border-slate-800/80 
        shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3),0_16px_40px_-15px_rgba(0,0,0,0.5)]
        flex 
        flex-col 
        justify-between 
        p-5
        relative
        z-10
        "
      >
        {/* Subtle ambient mesh color accents inside the component boundary */}
        <div className="absolute bottom-[-10px] left-[-10px] w-36 h-36 bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Branding Block */}
          <div className="px-4 py-5 mb-6 flex items-center gap-4 border-b border-slate-800/40">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-900/50">
              <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-xs" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-100">
                MENU
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Operator Panel
              </p>
            </div>
          </div>

          {/* Large, Tactile Menu Links */}
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex 
                    items-center 
                    gap-4 
                    px-5 
                    py-4 
                    rounded-2xl 
                    text-sm 
                    font-bold
                    tracking-wide
                    transition-all 
                    duration-300
                    group
                    relative
                    ${
                      isActive
                        ? "bg-slate-800/90 text-white border border-slate-700/50 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.2)]"
                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                    }
                  `}
                >
                  {/* Anchor point dot indicator */}
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
                  )}

                  <div 
                    className={`
                    transition-all
                    duration-300 
                    group-hover:scale-105
                    ${
                      isActive 
                        ? "text-indigo-400" 
                        : "text-slate-500 group-hover:text-orange-400"
                    }
                    `}
                  >
                    {item.icon}
                  </div>
                  <span className="transition-colors duration-200">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>


        
        {/* Lower Session Identity Plate */}
        <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl flex items-center justify-between shadow-inner relative z-10">
          <div className="flex flex-col">
            
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
          <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
