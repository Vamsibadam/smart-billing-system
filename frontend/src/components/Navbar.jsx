import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  User,
  Sparkles,
  Menu,
} from "lucide-react";

function Navbar({ onMenuClick }) {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (

    <div className="p-2 sm:p-4 w-full bg-transparent">

      <div
        className="
          min-h-16
          sm:h-20

          bg-gradient-to-r
          from-slate-900
          via-[#0F172A]
          to-slate-900/90

          backdrop-blur-md

          rounded-2xl
          sm:rounded-[24px]

          border
          border-slate-800/80

          flex
          items-center
          justify-between

          px-3
          sm:px-8

          py-2
          sm:py-0

          shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3),0_16px_40px_-15px_rgba(0,0,0,0.5)]

          relative
          z-50

          gap-2
        "
      >

        {/* Ambient Glow */}

        <div
          className="
            absolute
            top-0
            left-0
            w-32
            h-full
            bg-gradient-to-r
            from-orange-500/5
            to-transparent
            pointer-events-none
            rounded-l-[24px]
          "
        />

        <div
          className="
            absolute
            top-0
            right-0
            w-32
            h-full
            bg-gradient-to-l
            from-indigo-500/5
            to-transparent
            pointer-events-none
            rounded-r-[24px]
          "
        />


        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="flex items-center gap-2 sm:gap-3.5 relative z-10 min-w-0">

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="
              md:hidden

              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-xl

              bg-slate-800
              border
              border-slate-700

              text-slate-300

              hover:bg-slate-700
              hover:text-white

              active:scale-95

              transition-all
            "
            aria-label="Open menu"
          >

            <Menu size={20} />

          </button>


          {/* Branding */}

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3.5

              group
              cursor-pointer

              relative
              z-10

              min-w-0
            "
            onClick={() => navigate("/dashboard")}
          >

            <div
              className="
                w-9
                h-9
                sm:w-10
                sm:h-10

                flex-shrink-0

                rounded-xl
                sm:rounded-2xl

                bg-gradient-to-tr
                from-orange-500
                to-indigo-500

                flex
                items-center
                justify-center

                shadow-md
                shadow-indigo-900/50
              "
            >

              <Sparkles
                size={15}
                className="text-white sm:w-4 sm:h-4"
              />

            </div>


            <div className="min-w-0">

              <h1
                className="
                  text-sm
                  sm:text-lg

                  font-bold
                  tracking-tight

                  text-slate-100

                  truncate
                "
              >
                Smart Billing System
              </h1>

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div
          className="
            flex
            items-center

            gap-2
            sm:gap-4

            relative
            z-10
          "
        >

          {/* Change Password */}

          <button
            type="button"
            onClick={() =>
              navigate("/change-password")
            }
            className="
              hidden
              sm:inline-flex

              items-center
              gap-2

              bg-slate-800/90

              text-slate-300

              border
              border-slate-700/50

              px-4
              py-2.5

              rounded-2xl

              text-xs
              font-semibold

              hover:bg-slate-800
              hover:text-white
              hover:border-slate-600

              transition-all
              duration-200
            "
          >

            <KeyRound
              size={14}
              className="text-slate-400"
            />

            <span>
              Change Password
            </span>

          </button>


          {/* User Badge */}

          <div
            className="
              flex
              items-center

              gap-2
              sm:gap-3

              px-2
              sm:px-3.5

              py-2

              bg-slate-950/50

              border
              border-slate-800/60

              rounded-xl
              sm:rounded-2xl

              shadow-inner
            "
          >

            {/* User Icon */}

            <div
              className="
                w-7
                h-7

                flex-shrink-0

                rounded-xl

                bg-gradient-to-br
                from-indigo-500/10
                to-purple-500/10

                flex
                items-center
                justify-center

                text-indigo-400

                border
                border-indigo-500/20
              "
            >

              <User size={14} />

            </div>


            {/* User Information */}

            <div className="hidden sm:flex flex-col text-left">

              <span
                className="
                  text-[9px]
                  font-bold
                  text-slate-500
                  uppercase
                  tracking-wider
                  leading-none
                "
              >
                Active Session
              </span>

              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-300

                  mt-1
                  leading-none

                  max-w-[140px]
                  truncate
                "
              >
                {localStorage.getItem("username") ||
                  "Operator_01"}
              </span>

            </div>

          </div>


          {/* Divider */}

          <div
            className="
              hidden
              sm:block

              h-5
              w-px

              bg-slate-800/60
            "
          />


          {/* Logout */}

          <button
            type="button"
            onClick={logout}
            className="
              hidden
              sm:inline-flex

              items-center
              justify-center

              bg-slate-800/90

              text-slate-300

              border
              border-slate-700/50

              px-4
              py-2.5

              rounded-2xl

              text-xs
              font-semibold

              hover:bg-red-500/10
              hover:text-red-400
              hover:border-red-500/20

              transition-all
            "
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Navbar;