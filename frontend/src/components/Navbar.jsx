import { useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.clear();

    navigate("/login");
  };

  return (

    <div
      className="
      h-16
      bg-white
      shadow-sm
      flex
      items-center
      justify-between
      px-6
      "
    >

      <h1
        className="
        text-xl
        font-semibold
        text-slate-700
        "
      >
        Smart Billing System
      </h1>

      <div className="flex items-center gap-4">

        <button
          onClick={() =>
            navigate(
              "/change-password"
            )
          }
          className="
          bg-slate-600
          text-white
          px-4
          py-2
          rounded-lg
          hover:bg-slate-700
          "
        >
          Change Password
        </button>

        <span
          className="
          text-slate-500
          text-sm
          "
        >
          {
            localStorage.getItem(
              "username"
            )
          }
        </span>

        <button
          onClick={logout}
          className="
          bg-red-500
          text-white
          px-4
          py-2
          rounded-lg
          hover:bg-red-600
          "
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;