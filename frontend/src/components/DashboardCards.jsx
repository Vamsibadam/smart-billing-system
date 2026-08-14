function DashboardCards({
  icon,
  title,
  value,
  onClick,
  hint,
  className = "",
}) {
  const name = title?.toLowerCase() || "";

  let theme = {
    accent: "text-indigo-400",
    dot: "bg-indigo-400",
    glow: "bg-indigo-500",
    line: "bg-indigo-400",
    rgb: "129, 140, 248",
  };

  if (name.includes("today")) {
    theme = {
      accent: "text-orange-400",
      dot: "bg-orange-400",
      glow: "bg-orange-500",
      line: "bg-orange-400",
      rgb: "251, 146, 60",
    };
  } else if (name.includes("weekly")) {
    theme = {
      accent: "text-blue-400",
      dot: "bg-blue-400",
      glow: "bg-blue-500",
      line: "bg-blue-400",
      rgb: "96, 165, 250",
    };
  } else if (name.includes("monthly sales")) {
    theme = {
      accent: "text-violet-400",
      dot: "bg-violet-400",
      glow: "bg-violet-500",
      line: "bg-violet-400",
      rgb: "167, 139, 250",
    };
  } else if (name.includes("transaction")) {
    theme = {
      accent: "text-cyan-400",
      dot: "bg-cyan-400",
      glow: "bg-cyan-500",
      line: "bg-cyan-400",
      rgb: "34, 211, 238",
    };
  } else if (
    name.includes("expense") ||
    name.includes("expenses")
  ) {
    theme = {
      accent: "text-rose-400",
      dot: "bg-rose-400",
      glow: "bg-rose-500",
      line: "bg-rose-400",
      rgb: "251, 113, 133",
    };
  }

  /*
   * Different cards start at different times.
   * This makes the dashboard feel alive instead of
   * making every card move simultaneously.
   */
  const animationDelay = name.includes("today")
    ? "0s"
    : name.includes("weekly")
    ? "0.8s"
    : name.includes("monthly sales")
    ? "1.6s"
    : name.includes("transaction")
    ? "2.4s"
    : "3.2s";

  return (
    <div
      onClick={onClick}
      style={{
        "--card-rgb": theme.rgb,
        "--animation-delay": animationDelay,
      }}
      className={`
        dashboard-stat-card

        group
        relative
        overflow-hidden

        h-[112px]
        w-full

        rounded-[22px]

        bg-[#111827]!

        border
        border-white/[0.10]

        shadow-[0_10px_30px_-15px_rgba(0,0,0,0.65)]

        transition-all
        duration-300

        ${
          onClick
            ? `
              cursor-pointer

              hover:-translate-y-1

              hover:border-white/[0.18]

              hover:shadow-[0_18px_40px_-15px_rgba(0,0,0,0.8)]

              active:scale-[0.98]
            `
            : ""
        }

        ${className}
      `}
    >

      {/* =====================================================
          MOVING LIGHT BEAM
      ====================================================== */}

      <div
        className="
          dashboard-light-beam

          pointer-events-none

          absolute
          -top-20
          -left-1/2

          h-72
          w-32

          rotate-[25deg]

          opacity-0

          blur-2xl

          bg-white/[0.12]
        "
      />


      {/* =====================================================
          MAIN COLORED GLOW
      ====================================================== */}

      <div
        className={`
          dashboard-main-glow

          pointer-events-none

          absolute

          -right-14
          -top-14

          h-36
          w-36

          rounded-full

          ${theme.glow}

          opacity-[0.10]

          blur-3xl
        `}
      />


      {/* =====================================================
          SECONDARY GLOW
      ====================================================== */}

      <div
        className={`
          dashboard-secondary-glow

          pointer-events-none

          absolute

          -bottom-16
          -left-12

          h-32
          w-32

          rounded-full

          ${theme.glow}

          opacity-[0.05]

          blur-3xl
        `}
      />


      {/* =====================================================
          TOP GLASS HIGHLIGHT
      ====================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          top-0
          left-5
          right-5

          h-px

          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
        "
      />


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10

          flex
          h-full
          w-full

          items-center
          justify-between

          px-5
          sm:px-6
        "
      >

        {/* ===================================================
            LEFT CONTENT
        ==================================================== */}

        <div className="min-w-0">

          {/* TITLE */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className={`
                dashboard-stat-dot

                h-1.5
                w-1.5

                flex-shrink-0

                rounded-full

                ${theme.dot}

                shadow-[0_0_8px_currentColor]
              `}
            />

            <span
              className="
                block

                max-w-[180px]

                truncate

                text-[10px]

                font-black

                uppercase
                tracking-[0.16em]

                text-slate-300

                transition-colors
                duration-300

                group-hover:text-white
              "
            >
              {title}
            </span>

          </div>


          {/* VALUE */}

          <h2
            className="
              mt-2

              text-[22px]
              sm:text-[23px]

              font-black

              leading-none

              tracking-tight

              text-white

              transition-transform
              duration-300

              group-hover:translate-x-0.5
            "
          >
            {value}
          </h2>


          {/* HINT */}

          {hint && (
            <p
              className={`
                mt-2

                text-[10px]

                font-bold

                ${theme.accent}
              `}
            >
              {hint}
            </p>
          )}

        </div>


        {/* ===================================================
            ICON
        ==================================================== */}

        <div
          className={`
            dashboard-stat-icon

            relative

            flex
            h-11
            w-11

            flex-shrink-0

            items-center
            justify-center

            rounded-[15px]

            border
            border-white/[0.10]

            bg-white/[0.06]

            ${theme.accent}

            transition-all
            duration-500

            group-hover:scale-110
            group-hover:rotate-3
            group-hover:bg-white/[0.10]
          `}
        >

          {/* Icon Glow */}

          <div
            className={`
              absolute
              inset-0

              rounded-[15px]

              ${theme.glow}

              opacity-0

              blur-xl

              transition-opacity
              duration-500

              group-hover:opacity-30
            `}
          />

          <div className="relative z-10">
            {icon}
          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM PROGRESS LIGHT
      ====================================================== */}

      <div
        className="
          pointer-events-none

          absolute
          bottom-0
          left-5
          right-5

          h-[2px]

          overflow-hidden

          rounded-full

          bg-white/[0.06]
        "
      >

        <div
          className={`
            dashboard-stat-line

            h-full

            w-[30%]

            rounded-full

            ${theme.line}
          `}
        />

      </div>


      {/* =====================================================
          ANIMATIONS
      ====================================================== */}

      <style>
        {`

          /* ================================================
             FLOATING CARD
          ================================================= */

          @keyframes dashboardCardFloat {

            0%,
            100% {
              transform: translateY(0px);
            }

            50% {
              transform: translateY(-4px);
            }

          }


          /* ================================================
             MOVING LIGHT
          ================================================= */

          @keyframes dashboardLightSweep {

            0% {
              left: -45%;
              opacity: 0;
            }

            12% {
              opacity: 0.35;
            }

            35% {
              opacity: 0.12;
            }

            55% {
              opacity: 0;
            }

            100% {
              left: 135%;
              opacity: 0;
            }

          }


          /* ================================================
             MAIN GLOW
          ================================================= */

          @keyframes dashboardMainGlow {

            0%,
            100% {
              transform:
                scale(1)
                translate(0px, 0px);

              opacity: 0.08;
            }

            50% {
              transform:
                scale(1.35)
                translate(-10px, 8px);

              opacity: 0.20;
            }

          }


          /* ================================================
             SECONDARY GLOW
          ================================================= */

          @keyframes dashboardSecondaryGlow {

            0%,
            100% {
              transform:
                scale(1)
                translate(0px, 0px);

              opacity: 0.035;
            }

            50% {
              transform:
                scale(1.3)
                translate(10px, -8px);

              opacity: 0.10;
            }

          }


          /* ================================================
             ICON PULSE
          ================================================= */

          @keyframes dashboardIconPulse {

            0%,
            100% {
              transform: scale(1);

              box-shadow:
                0 0 0 rgba(
                  var(--card-rgb),
                  0
                );
            }

            50% {
              transform: scale(1.06);

              box-shadow:
                0 0 22px rgba(
                  var(--card-rgb),
                  0.20
                );
            }

          }


          /* ================================================
             DOT PULSE
          ================================================= */

          @keyframes dashboardDotPulse {

            0%,
            100% {
              transform: scale(1);
              opacity: 0.7;
            }

            50% {
              transform: scale(1.5);
              opacity: 1;
            }

          }


          /* ================================================
             BOTTOM LINE
          ================================================= */

          @keyframes dashboardLineMove {

            0%,
            100% {
              width: 28%;
              opacity: 0.45;
            }

            50% {
              width: 65%;
              opacity: 1;
            }

          }


          /* =================================================
             MOBILE ANIMATIONS
          ================================================= */

          @media (max-width: 767px) {

            .dashboard-stat-card {
              animation:
                dashboardCardFloat
                4.5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-light-beam {
              animation:
                dashboardLightSweep
                5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-main-glow {
              animation:
                dashboardMainGlow
                3.8s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-secondary-glow {
              animation:
                dashboardSecondaryGlow
                5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-stat-icon {
              animation:
                dashboardIconPulse
                3.2s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-stat-dot {
              animation:
                dashboardDotPulse
                2.8s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }


            .dashboard-stat-line {
              animation:
                dashboardLineMove
                4s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

          }


          /* =================================================
             TOUCH DEVICES
          ================================================= */

          @media (hover: none) and (pointer: coarse) {

            .dashboard-stat-card {
              animation:
                dashboardCardFloat
                4.5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-light-beam {
              animation:
                dashboardLightSweep
                5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-main-glow {
              animation:
                dashboardMainGlow
                3.8s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-secondary-glow {
              animation:
                dashboardSecondaryGlow
                5s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-stat-icon {
              animation:
                dashboardIconPulse
                3.2s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-stat-dot {
              animation:
                dashboardDotPulse
                2.8s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

            .dashboard-stat-line {
              animation:
                dashboardLineMove
                4s
                ease-in-out
                infinite;

              animation-delay:
                var(--animation-delay);
            }

          }


          /* =================================================
             ACCESSIBILITY
          ================================================= */

          @media (prefers-reduced-motion: reduce) {

            .dashboard-stat-card,
            .dashboard-light-beam,
            .dashboard-main-glow,
            .dashboard-secondary-glow,
            .dashboard-stat-icon,
            .dashboard-stat-dot,
            .dashboard-stat-line {
              animation: none !important;
            }

          }

        `}
      </style>

    </div>
  );
}

export default DashboardCards;