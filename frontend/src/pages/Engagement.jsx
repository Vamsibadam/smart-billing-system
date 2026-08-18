import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  BadgePercent,
  Users,
  Send,
  ChevronRight,
  Megaphone,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";

function Engagement() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "WhatsApp",
      description:
        "Send invoices, customer messages and promotional campaigns through WhatsApp.",
      icon: MessageCircle,
      path: "/engagement/whatsapp",
      status: "Active",
      accent: "emerald",
      disabled: false,
    },

    {
      title: "Discounts",
      description:
        "Create and manage product offers and direct customer discounts.",
      icon: BadgePercent,
      path: "/engagement/discounts",
      status: "Active",
      accent: "orange",
      disabled: false,
    },

    {
      title: "Customers",
      description:
        "View customers, visit history, spending and customer activity.",
      icon: Users,
      path: "/engagement/customers",
      status: "Coming Soon",
      accent: "indigo",
      disabled: true,
    },

    {
      title: "Campaigns",
      description:
        "Create targeted promotional campaigns and reach selected customers.",
      icon: Send,
      path: "/engagement/campaigns",
      status: "Coming Soon",
      accent: "purple",
      disabled: true,
    },
  ];

  const accentStyles = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
      glow: "bg-emerald-400/10",
      line: "bg-emerald-500",
      hover: "group-hover:text-emerald-600",
    },

    orange: {
      icon: "bg-orange-50 text-orange-600 border-orange-100",
      glow: "bg-orange-400/10",
      line: "bg-orange-500",
      hover: "group-hover:text-orange-600",
    },

    indigo: {
      icon: "bg-indigo-50 text-indigo-600 border-indigo-100",
      glow: "bg-indigo-400/10",
      line: "bg-indigo-500",
      hover: "group-hover:text-indigo-600",
    },

    purple: {
      icon: "bg-purple-50 text-purple-600 border-purple-100",
      glow: "bg-purple-400/10",
      line: "bg-purple-500",
      hover: "group-hover:text-purple-600",
    },
  };

  return (
    <MainLayout>
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-7">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 sm:mb-7">

          <div
            className="
              flex
              items-center
              gap-2

              text-[10px]
              sm:text-[11px]

              font-black
              uppercase
              tracking-[0.18em]

              text-indigo-500
            "
          >
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center

                rounded-lg

                bg-indigo-50
                border
                border-indigo-100

                animate-[pulse_3s_ease-in-out_infinite]
              "
            >
              <Megaphone size={14} />
            </div>

            Customer Engagement
          </div>


          <div
            className="
              mt-2

              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <h1
                className="
                  text-[25px]
                  sm:text-3xl

                  font-black
                  tracking-tight

                  text-slate-800
                "
              >
                Engagement & Marketing
              </h1>

              <p
                className="
                  mt-1.5

                  max-w-2xl

                  text-xs
                  sm:text-sm

                  leading-relaxed

                  font-medium
                  text-slate-500
                "
              >
                Manage WhatsApp communication, discounts,
                customers and future marketing campaigns
                from one place.
              </p>

            </div>


            {/* Small decorative badge */}

            <div
              className="
                hidden
                sm:flex

                items-center
                gap-2

                rounded-xl

                border
                border-slate-200

                bg-white

                px-3
                py-2

                text-[10px]
                font-bold

                text-slate-500

                shadow-sm
              "
            >
              <Sparkles
                size={13}
                className="text-indigo-500"
              />

              <span>
                Customer Tools
              </span>
            </div>

          </div>

        </div>


        {/* =====================================================
            MODULE GRID
        ====================================================== */}

        <div
          className="
            grid

            grid-cols-1
            sm:grid-cols-2

            gap-4
            lg:gap-5

            w-full
            min-w-0
          "
        >

          {modules.map((module, index) => {

            const Icon = module.icon;

            const accent =
              accentStyles[module.accent];


            return (
              <button
                key={module.title}
                type="button"

                disabled={module.disabled}

                onClick={() => {

                  if (!module.disabled) {
                    navigate(module.path);
                  }

                }}

                className={`
                  group

                  relative
                  w-full
                  min-w-0

                  overflow-hidden

                  text-left

                  rounded-[22px]

                  border

                  bg-white

                  px-4
                  py-4

                  sm:px-5
                  sm:py-5

                  ${
                    module.disabled
                      ? `
                        border-slate-200/80
                        opacity-65
                        cursor-not-allowed
                      `
                      : `
                        border-slate-200/80
                        cursor-pointer

                        hover:-translate-y-1
                        hover:border-slate-300

                        hover:shadow-[0_16px_35px_-18px_rgba(15,23,42,0.30)]
                      `
                  }

                  shadow-[0_5px_18px_-12px_rgba(15,23,42,0.20)]

                  transition-all
                  duration-300

                  animate-[fadeInUp_0.5s_ease-out_both]
                `}

                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >

                {/* =================================================
                    AMBIENT GLOW
                ================================================== */}

                <div
                  className={`
                    absolute

                    -right-10
                    -top-10

                    h-28
                    w-28

                    rounded-full

                    ${accent.glow}

                    blur-2xl

                    pointer-events-none

                    transition-all
                    duration-500

                    ${
                      !module.disabled
                        ? "group-hover:scale-150"
                        : ""
                    }
                  `}
                />


                {/* =================================================
                    BOTTOM ACCENT LINE
                ================================================== */}

                {!module.disabled && (

                  <div
                    className={`
                      absolute

                      bottom-0
                      left-5

                      h-[2px]

                      w-10

                      rounded-full

                      ${accent.line}

                      opacity-60

                      transition-all
                      duration-500

                      group-hover:w-20
                      group-hover:opacity-100
                    `}
                  />

                )}


                {/* =================================================
                    TOP ROW
                ================================================== */}

                <div
                  className="
                    relative
                    z-10

                    flex
                    items-center
                    justify-between
                  "
                >

                  {/* Icon */}

                  <div
                    className={`
                      flex

                      h-10
                      w-10

                      sm:h-11
                      sm:w-11

                      shrink-0

                      items-center
                      justify-center

                      rounded-xl

                      border

                      ${accent.icon}

                      transition-all
                      duration-300

                      ${
                        !module.disabled
                          ? `
                            group-hover:scale-110
                            group-hover:rotate-2
                          `
                          : ""
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={2}
                    />
                  </div>


                  {/* Status */}

                  <span
                    className={`
                      rounded-lg

                      px-2
                      py-1

                      text-[8px]
                      sm:text-[9px]

                      font-black
                      uppercase
                      tracking-wider

                      ${
                        module.disabled
                          ? `
                            bg-slate-100
                            text-slate-400
                            border
                            border-slate-200
                          `
                          : `
                            bg-emerald-50
                            text-emerald-600
                            border
                            border-emerald-100
                          `
                      }
                    `}
                  >
                    {module.status}
                  </span>

                </div>


                {/* =================================================
                    CONTENT
                ================================================== */}

                <div
                  className="
                    relative
                    z-10

                    mt-4
                  "
                >

                  <h2
                    className={`
                      text-base
                      sm:text-[17px]

                      font-black

                      tracking-tight

                      text-slate-800

                      transition-colors
                      duration-300

                      ${
                        !module.disabled
                          ? accent.hover
                          : ""
                      }
                    `}
                  >
                    {module.title}
                  </h2>


                  <p
                    className="
                      mt-1.5

                      min-h-[40px]

                      text-[11px]
                      sm:text-xs

                      leading-[1.55]

                      font-medium

                      text-slate-500
                    "
                  >
                    {module.description}
                  </p>

                </div>


                {/* =================================================
                    FOOTER
                ================================================== */}

                {!module.disabled ? (

                  <div
                    className="
                      relative
                      z-10

                      mt-4
                      pt-3

                      border-t
                      border-slate-100

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className={`
                        text-[10px]
                        sm:text-[11px]

                        font-black

                        text-indigo-600

                        transition-all
                        duration-300

                        group-hover:translate-x-0.5
                      `}
                    >
                      Open Module
                    </span>


                    <div
                      className="
                        flex
                        h-6
                        w-6

                        items-center
                        justify-center

                        rounded-lg

                        bg-slate-50

                        border
                        border-slate-100

                        transition-all
                        duration-300

                        group-hover:bg-indigo-50
                      "
                    >

                      <ChevronRight
                        size={14}
                        className="
                          text-slate-400

                          transition-all
                          duration-300

                          group-hover:translate-x-0.5
                          group-hover:text-indigo-600
                        "
                      />

                    </div>

                  </div>

                ) : (

                  <div
                    className="
                      relative
                      z-10

                      mt-4
                      pt-3

                      border-t
                      border-slate-100

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-[9px]
                        sm:text-[10px]

                        font-bold

                        uppercase
                        tracking-wider

                        text-slate-400
                      "
                    >
                      Module unavailable
                    </span>

                    <span
                      className="
                        text-slate-300

                        text-xs
                        font-bold
                      "
                    >
                      •••
                    </span>

                  </div>

                )}

              </button>
            );

          })}

        </div>


        {/* =====================================================
            MOBILE BOTTOM INFO
        ====================================================== */}

        <div
          className="
            mt-5

            flex
            sm:hidden

            items-center
            justify-center
            gap-2

            rounded-xl

            border
            border-slate-200

            bg-white/70

            px-3
            py-2.5

            text-[9px]
            font-bold
            tracking-wide

            text-slate-400
          "
        >

          <Sparkles
            size={12}
            className="text-indigo-400"
          />

          More customer tools are coming soon

        </div>

      </div>


      {/* =====================================================
          ANIMATION KEYFRAMES
      ====================================================== */}

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 640px) {
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(8px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          }
        `}
      </style>

    </MainLayout>
  );
}

export default Engagement;