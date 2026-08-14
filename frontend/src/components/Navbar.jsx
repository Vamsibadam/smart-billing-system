import { useNavigate } from "react-router-dom";

import {
  KeyRound,
  User,
  ReceiptText,
  Menu,
  LogOut,
} from "lucide-react";


function Navbar({ onMenuClick }) {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const username =
    localStorage.getItem("username") || "Operator_01";


  return (
    <>

      {/* =====================================================
          NEXBILL MOBILE ANIMATIONS
      ====================================================== */}

      <style>{`

        @keyframes nexLogoFloat {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }

        }


        @keyframes nexLogoGlow {

          0%,
          100% {
            box-shadow:
              0 5px 16px rgba(99,102,241,0.25);
          }

          50% {
            box-shadow:
              0 7px 26px rgba(249,115,22,0.42),
              0 0 18px rgba(129,140,248,0.25);
          }

        }


        @keyframes nexLogoShine {

          0% {
            transform: translateX(-180%) rotate(18deg);
            opacity: 0;
          }

          15% {
            opacity: 0.1;
          }

          35% {
            opacity: 0.45;
          }

          55% {
            opacity: 0;
          }

          100% {
            transform: translateX(180%) rotate(18deg);
            opacity: 0;
          }

        }


        @keyframes nexTextPulse {

          0%,
          100% {
            opacity: 1;
            transform: translateX(0);
          }

          50% {
            opacity: 0.9;
            transform: translateX(1px);
          }

        }


        @keyframes nexMenuPulse {

          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.04);
          }

        }


        @keyframes nexControlPulse {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }

        }


        @keyframes nexUserGlow {

          0%,
          100% {
            box-shadow:
              0 0 0 rgba(99,102,241,0);
          }

          50% {
            box-shadow:
              0 0 15px rgba(99,102,241,0.2);
          }

        }


        .nex-logo-animation {

          animation:
            nexLogoFloat 3s ease-in-out infinite,
            nexLogoGlow 3s ease-in-out infinite;

        }


        .nex-logo-shine {

          animation:
            nexLogoShine 4s ease-in-out infinite;

        }


        .nex-text-animation {

          animation:
            nexTextPulse 3s ease-in-out infinite;

        }


        .nex-menu-animation {

          animation:
            nexMenuPulse 3s ease-in-out infinite;

        }


        .nex-control-animation {

          animation:
            nexControlPulse 3.5s ease-in-out infinite;

        }


        .nex-user-animation {

          animation:
            nexUserGlow 3s ease-in-out infinite;

        }


        /* =====================================================
           DESKTOP
           Keep desktop professional/static
        ====================================================== */

        @media (min-width: 1024px) {

          .nex-logo-animation,
          .nex-logo-shine,
          .nex-text-animation,
          .nex-menu-animation,
          .nex-control-animation,
          .nex-user-animation {

            animation: none;

          }

        }


        /* =====================================================
           MOBILE
           Slightly stronger animations
        ====================================================== */

        @media (max-width: 1023px) {

          .nex-logo-animation {
            animation:
              nexLogoFloat 3s ease-in-out infinite,
              nexLogoGlow 3s ease-in-out infinite;
          }

          .nex-text-animation {
            animation:
              nexTextPulse 3s ease-in-out infinite;
          }

          .nex-menu-animation {
            animation:
              nexMenuPulse 3s ease-in-out infinite;
          }

          .nex-control-animation {
            animation:
              nexControlPulse 3.5s ease-in-out infinite;
          }

          .nex-user-animation {
            animation:
              nexUserGlow 3s ease-in-out infinite;
          }

        }

      `}</style>


      {/* =====================================================
          NAVBAR WRAPPER
      ====================================================== */}

      <div className="w-full">


        {/* ===================================================
            NAVBAR BOX
        ==================================================== */}

        <div
          className="
            relative
            z-50

            w-full

            min-h-[80px]
            lg:h-20

            flex
            items-center
            justify-between

            gap-2

            px-4
            lg:px-8

            py-3
            lg:py-0

            bg-gradient-to-r
            from-slate-900
            via-[#111827]
            to-slate-900

            rounded-2xl
            lg:rounded-[24px]

            border
            border-slate-800/80

            shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3),0_16px_40px_-15px_rgba(0,0,0,0.5)]

            overflow-hidden
          "
        >


          {/* =================================================
              AMBIENT LEFT LIGHT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0

              w-32
              lg:w-44

              bg-gradient-to-r
              from-orange-500/[0.07]
              to-transparent
            "
          />


          {/* =================================================
              AMBIENT RIGHT LIGHT
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0

              w-32
              lg:w-44

              bg-gradient-to-l
              from-indigo-500/[0.07]
              to-transparent
            "
          />


          {/* =====================================================
              LEFT SECTION
          ====================================================== */}

          <div
            className="
              relative
              z-10

              flex
              flex-shrink-0

              items-center

              gap-2.5
              lg:gap-3.5
            "
          >


            {/* =================================================
                MOBILE MENU
            ================================================== */}

            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="
                nex-menu-animation

                md:hidden

                flex
                h-12
                w-12

                flex-shrink-0

                items-center
                justify-center

                rounded-2xl

                border
                border-slate-700

                bg-slate-800

                text-slate-300

                transition-all
                duration-200

                hover:bg-slate-700
                hover:text-white

                active:scale-95
              "
            >

              <Menu
                size={24}
                strokeWidth={2.2}
              />

            </button>


            {/* =================================================
                NEXBILL BRAND
            ================================================== */}

            <div
              className="
                group

                relative
                z-10

                flex
                flex-shrink-0

                cursor-pointer

                items-center

                gap-2.5
                lg:gap-3

                min-w-[140px]
                lg:min-w-0
              "
              onClick={() =>
                navigate("/dashboard")
              }
            >


              {/* =================================================
                  LOGO
              ================================================== */}

              <div
                className="
                  nex-logo-animation

                  relative

                  flex

                  h-12
                  w-12

                  lg:h-11
                  lg:w-11

                  flex-shrink-0

                  items-center
                  justify-center

                  overflow-hidden

                  rounded-2xl

                  bg-gradient-to-br
                  from-orange-500
                  via-amber-500
                  to-indigo-500

                  shadow-[0_5px_18px_rgba(99,102,241,0.25)]

                  transition-transform
                  duration-300

                  group-hover:scale-105
                "
              >

                {/* Shine */}

                <div
                  className="
                    nex-logo-shine

                    pointer-events-none

                    absolute

                    -left-1/2
                    top-[-30%]

                    h-[160%]
                    w-1/2

                    rotate-[18deg]

                    bg-gradient-to-r
                    from-transparent
                    via-white/50
                    to-transparent
                  "
                />


                <ReceiptText
                  size={23}
                  strokeWidth={2.5}
                  className="
                    relative
                    z-10

                    text-white
                  "
                />

              </div>


              {/* =================================================
                  NEXBILL TEXT
              ================================================== */}

              <h1
                className="
                  nex-text-animation

                  whitespace-nowrap

                  flex-shrink-0

                  text-[24px]
                  lg:text-xl

                  font-black

                  tracking-[-0.035em]

                  leading-none

                  text-white
                "
              >
                NexBill
              </h1>

            </div>

          </div>


          {/* =====================================================
              RIGHT SECTION
          ====================================================== */}

          <div
            className="
              relative
              z-10

              flex
              flex-shrink-0

              items-center

              gap-2
              lg:gap-4
            "
          >


            {/* =================================================
                CHANGE PASSWORD
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                navigate("/change-password")
              }
              aria-label="Change Password"
              title="Change Password"
              className="
                nex-control-animation

                flex

                h-12
                w-12

                lg:h-auto
                lg:w-auto

                flex-shrink-0

                items-center
                justify-center

                gap-2

                rounded-2xl
                lg:rounded-2xl

                border
                border-slate-700/50

                bg-slate-800/90

                px-0
                lg:px-4

                py-0
                lg:py-2.5

                text-xs
                font-semibold

                text-slate-300

                transition-all
                duration-200

                hover:border-slate-600
                hover:bg-slate-800
                hover:text-white

                active:scale-95
              "
            >

              <KeyRound
                size={19}
                className="text-slate-400"
              />


              <span
                className="
                  hidden
                  lg:inline
                "
              >
                Change Password
              </span>

            </button>


            {/* =================================================
                USER BADGE
            ================================================== */}

            <div
              className="
                nex-user-animation

                flex

                h-12
                w-12

                lg:h-auto
                lg:w-auto

                flex-shrink-0

                items-center

                justify-center

                gap-3

                rounded-2xl
                lg:rounded-2xl

                border
                border-slate-800/60

                bg-slate-950/50

                px-0
                lg:px-3.5

                py-2

                shadow-inner
              "
            >

              {/* User Icon */}

              <div
                className="
                  flex

                  h-8
                  w-8

                  flex-shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-indigo-500/20

                  bg-gradient-to-br
                  from-indigo-500/10
                  to-purple-500/10

                  text-indigo-400
                "
              >

                <User size={16} />

              </div>


              {/* User Details */}

              <div
                className="
                  hidden
                  lg:flex

                  flex-col

                  text-left
                "
              >

                <span
                  className="
                    text-[9px]

                    font-bold

                    uppercase

                    tracking-wider

                    leading-none

                    text-slate-500
                  "
                >
                  Active Session
                </span>


                <span
                  className="
                    mt-1

                    max-w-[140px]

                    truncate

                    text-xs

                    font-semibold

                    leading-none

                    text-slate-300
                  "
                >
                  {username}
                </span>

              </div>

            </div>


            {/* =================================================
                DIVIDER
            ================================================== */}

            <div
              className="
                hidden
                lg:block

                h-5
                w-px

                bg-slate-800/60
              "
            />


            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="
                nex-control-animation

                flex

                h-12
                w-12

                lg:h-auto
                lg:w-auto

                flex-shrink-0

                items-center
                justify-center

                gap-2

                rounded-2xl
                lg:rounded-2xl

                border
                border-slate-700/50

                bg-slate-800/90

                px-0
                lg:px-4

                py-0
                lg:py-2.5

                text-xs
                font-semibold

                text-slate-300

                transition-all
                duration-200

                hover:border-red-500/20
                hover:bg-red-500/10
                hover:text-red-400

                active:scale-95
              "
            >

              <LogOut
                size={19}
              />


              <span
                className="
                  hidden
                  lg:inline
                "
              >
                Logout
              </span>

            </button>

          </div>

        </div>

      </div>

    </>
  );
}


export default Navbar;