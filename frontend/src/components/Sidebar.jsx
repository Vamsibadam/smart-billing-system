import { Link, useLocation } from "react-router-dom";


import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  FileText,
  KeyRound,
  History
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const menuItems = [

  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },

  {
    name: "Products",
    path: "/products",
    icon: <Package size={20} />,
  },

  {
    name: "Inventory",
    path: "/inventory",
    icon: <Boxes size={20} />,
  },

  {
    name: "Billing",
    path: "/billing",
    icon: <Receipt size={20} />,
  },

  {
    name: "Bill History",
    path: "/bill-history",
    icon: <History  size={20} />,
  },

  {
    name: "Reports",
    path: "/reports",
    icon: <FileText size={20} />,
  },

];

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white">

      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        Smart Billing
      </div>

      <div className="p-4 space-y-2">

        {menuItems.map((item) => (

          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200
              ${
                location.pathname === item.path
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
          >
            {item.icon}
            {item.name}
          </Link>

        ))}

      </div>

    </div>
  );
}

export default Sidebar;