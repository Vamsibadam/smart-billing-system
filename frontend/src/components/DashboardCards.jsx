import React from "react";

function DashboardCards({
  icon,
  title,
  value,
  onClick,
  hint,
  className = "",
}) {
  const name = title?.toLowerCase() || "";

  // Dynamic Theme Definitions (Liquid VisionOS Palette)
  let theme = {
    accent: "text-indigo-400",
    orbGradient: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)",
    iconOrb: "from-indigo-500/25 to-indigo-600/10 border-indigo-400/30 text-indigo-300",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-400/20",
    activeGlow: "rgba(99, 102, 241, 0.4)",
    dot: "bg-indigo-400",
  };

  if (name.includes("today")) {
    theme = {
      accent: "text-orange-400",
      orbGradient: "radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.38) 0%, rgba(251, 146, 60, 0.08) 50%, transparent 75%)",
      iconOrb: "from-orange-500/25 to-amber-600/10 border-orange-400/30 text-orange-300",
      badgeBg: "bg-orange-500/10 text-orange-300 border-orange-400/20",
      activeGlow: "rgba(249, 115, 22, 0.45)",
      dot: "bg-orange-400",
    };
  } else if (name.includes("weekly")) {
    theme = {
      accent: "text-sky-400",
      orbGradient: "radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 75%)",
      iconOrb: "from-sky-500/25 to-blue-600/10 border-sky-400/30 text-sky-300",
      badgeBg: "bg-sky-500/10 text-sky-300 border-sky-400/20",
      activeGlow: "rgba(56, 189, 248, 0.4)",
      dot: "bg-sky-400",
    };
  } else if (name.includes("monthly sales")) {
    theme = {
      accent: "text-violet-400",
      orbGradient: "radial-gradient(circle at 80% 20%, rgba(167, 139, 250, 0.35) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)",
      iconOrb: "from-violet-500/25 to-purple-600/10 border-violet-400/30 text-violet-300",
      badgeBg: "bg-violet-500/10 text-violet-300 border-violet-400/20",
      activeGlow: "rgba(167, 139, 250, 0.4)",
      dot: "bg-violet-400",
    };
  } else if (name.includes("transaction")) {
    theme = {
      accent: "text-emerald-400",
      orbGradient: "radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.35) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 75%)",
      iconOrb: "from-emerald-500/25 to-teal-600/10 border-emerald-400/30 text-emerald-300",
      badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
      activeGlow: "rgba(52, 211, 153, 0.4)",
      dot: "bg-emerald-400",
    };
  } else if (name.includes("expense")) {
    theme = {
      accent: "text-rose-400",
      orbGradient: "radial-gradient(circle at 80% 20%, rgba(251, 113, 133, 0.38) 0%, rgba(244, 63, 94, 0.08) 50%, transparent 75%)",
      iconOrb: "from-rose-500/25 to-red-600/10 border-rose-400/30 text-rose-300",
      badgeBg: "bg-rose-500/10 text-rose-300 border-rose-400/20",
      activeGlow: "rgba(251, 113, 133, 0.45)",
      dot: "bg-rose-400",
    };
  }

  const delay = name.includes("today")
    ? "0s"
    : name.includes("weekly")
    ? "0.6s"
    : name.includes("monthly sales")
    ? "1.2s"
    : name.includes("transaction")
    ? "1.8s"
    : "2.4s";

  return (
    <div
      onClick={onClick}
      style={{
        "--card-delay": delay,
        "--card-glow": theme.activeGlow,
      }}
      className={`
        liquid-glass-card
        group
        relative
        w-full
        h-[104px] sm:h-[114px]
        rounded-[24px]
        bg-[#0D1322]/90
        backdrop-blur-2xl
        border border-white/[0.08]
        border-t-white/[0.22]
        shadow-[0_16px_36px_-12px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.12)]
        overflow-hidden
        p-4 sm:p-5
        flex items-center justify-between
        transition-all duration-300 ease-out
        ${onClick ? "cursor-pointer active:scale-[0.98] hover:border-white/[0.25] hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {/* =========================================================
          1. LIQUID RADIAL AMBIENCE (Zero-lag Background Canvas)
      ========================================================== */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-90 group-hover:opacity-100"
        style={{ background: theme.orbGradient }}
      />

      {/* Fluid Subtle Corner Halo */}
      <div
        className="
          liquid-ambient-orb
          pointer-events-none
          absolute
          -right-8 -top-8
          w-32 h-32
          rounded-full
          blur-2xl
          opacity-30
        "
        style={{ backgroundColor: theme.activeGlow }}
      />

      {/* Surface Liquid Shimmer Reflex */}
      <div
        className="
          liquid-shimmer
          pointer-events-none
          absolute
          inset-y-0
          w-16
          bg-gradient-to-r
          from-transparent
          via-white/[0.09]
          to-transparent
          -skew-x-20
        "
      />

      {/* =========================================================
          2. METRIC TYPOGRAPHY & HEADER TAG
      ========================================================== */}
      <div className="relative z-10 min-w-0 pr-2">
        {/* Title row with live dot badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`
              w-1.5 h-1.5
              rounded-full
              ${theme.dot}
              shadow-[0_0_8px_currentColor]
              animate-pulse
            `}
          />
          <span
            className="
              text-[9.5px] sm:text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-slate-400
              group-hover:text-slate-200
              transition-colors
              truncate
              max-w-[130px] sm:max-w-[170px]
            "
          >
            {title}
          </span>
        </div>

        {/* Value Display */}
        <h2
          className="
            mt-1.5
            text-xl sm:text-[25px]
            font-black
            tracking-tight
            leading-none
            text-white
            group-hover:translate-x-0.5
            transition-transform duration-200
            truncate
          "
        >
          {value}
        </h2>

        {/* Action Hint / Footnote Tag */}
        {hint && (
          <div className="mt-1.5 flex items-center">
            <span
              className={`
                text-[8.5px] sm:text-[9px]
                font-black
                uppercase
                tracking-wider
                px-2 py-0.5
                rounded-md
                border
                ${theme.badgeBg}
                shadow-xs
              `}
            >
              {hint}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          3. LIQUID MERCURY ICON ORB (Frosted Sphere Pod)
      ========================================================== */}
      <div
        className={`
          liquid-icon-pod
          relative
          z-10
          shrink-0
          w-11 sm:w-12
          h-11 sm:h-12
          rounded-2xl
          bg-gradient-to-br
          ${theme.iconOrb}
          backdrop-blur-md
          border
          shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_6px_16px_rgba(0,0,0,0.3)]
          flex items-center justify-center
          transition-transform duration-300
          group-hover:scale-110
          group-hover:rotate-2
        `}
      >
        <div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {icon}
        </div>
      </div>

      {/* =========================================================
          GPU-ACCELERATED TRANSITIONS (Zero Layout Reflows)
      ====================================================== */}
      <style>{`
        /* 1. Fluid Ambient Corner Halo Breathing */
        @keyframes orbBreathe {
          0%, 100% {
            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
            opacity: 0.25;
          }
          50% {
            transform: scale3d(1.2, 1.2, 1) translate3d(-4px, 4px, 0);
            opacity: 0.45;
          }
        }

        /* 2. Micro Icon Floating Animation */
        @keyframes iconFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -2px, 0);
          }
        }

        /* 3. Surface Light Reflection Sweep */
        @keyframes shimmerSweep {
          0% {
            transform: translate3d(-250%, 0, 0);
            opacity: 0;
          }
          12% {
            opacity: 0.5;
          }
          25% {
            opacity: 0.15;
          }
          40%, 100% {
            transform: translate3d(450%, 0, 0);
            opacity: 0;
          }
        }

        .liquid-ambient-orb {
          animation: orbBreathe 4.2s ease-in-out infinite;
          animation-delay: var(--card-delay);
          will-change: transform, opacity;
        }

        .liquid-icon-pod {
          animation: iconFloat 3.2s ease-in-out infinite;
          animation-delay: var(--card-delay);
          will-change: transform;
        }

        .liquid-shimmer {
          animation: shimmerSweep 6.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          animation-delay: var(--card-delay);
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid-ambient-orb,
          .liquid-icon-pod,
          .liquid-shimmer {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardCards;