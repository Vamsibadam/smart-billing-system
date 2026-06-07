import { Link, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaBox,
  FaWarehouse,
  FaCashRegister,
  FaFileAlt,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <FaChartBar />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <FaBox />,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <FaWarehouse />,
    },
    {
      name: "Billing",
      path: "/billing",
      icon: <FaCashRegister />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
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