function SalesHeatmap({ data = [] }) {
  const days = [
    { label: "Sun", short: "S" },
    { label: "Mon", short: "M" },
    { label: "Tue", short: "T" },
    { label: "Wed", short: "W" },
    { label: "Thu", short: "T" },
    { label: "Fri", short: "F" },
    { label: "Sat", short: "S" },
  ];

  const hours = [
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
  ];

  /* ==========================================================
     MAX SALES
  ========================================================== */

  const maxSales = Math.max(
    ...data.map((item) => Number(item.sales)),
    1
  );


  /* ==========================================================
     GET CELL
  ========================================================== */

  const getCell = (weekday, hour) => {
    const item = data.find(
      (d) =>
        Number(d.weekday) === weekday &&
        Number(d.hour) === hour
    );

    return item ? Number(item.sales) : 0;
  };


  /* ==========================================================
     FORMAT HOUR
  ========================================================== */

  const formatHour = (hour) => {
    if (hour === 0) return "12AM";

    if (hour < 12) {
      return `${hour}AM`;
    }

    if (hour === 12) {
      return "12PM";
    }

    return `${hour - 12}PM`;
  };


  /* ==========================================================
     INTENSITY
  ========================================================== */

  const getIntensity = (sales) => {
    if (!sales) return 0;

    const ratio = sales / maxSales;

    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;

    return 5;
  };


  /* ==========================================================
     CELL STYLE
  ========================================================== */

  const getCellStyle = (intensity) => {
    const styles = {

      0: {
        background:
          "linear-gradient(145deg,#F8FAFC,#F1F5F9)",

        border:
          "rgba(226,232,240,0.9)",

        shadow:
          "0 2px 5px rgba(15,23,42,0.03)",
      },


      1: {
        background:
          "linear-gradient(145deg,#FFF7ED,#FFEDD5)",

        border:
          "rgba(251,146,60,0.18)",

        shadow:
          "0 3px 8px rgba(249,115,22,0.07)",
      },


      2: {
        background:
          "linear-gradient(145deg,#FFEDD5,#FED7AA)",

        border:
          "rgba(251,146,60,0.25)",

        shadow:
          "0 4px 10px rgba(249,115,22,0.10)",
      },


      3: {
        background:
          "linear-gradient(145deg,#EDE9FE,#C7D2FE)",

        border:
          "rgba(129,140,248,0.28)",

        shadow:
          "0 4px 11px rgba(99,102,241,0.10)",
      },


      4: {
        background:
          "linear-gradient(145deg,#A5B4FC,#818CF8)",

        border:
          "rgba(99,102,241,0.35)",

        shadow:
          "0 5px 14px rgba(79,70,229,0.18)",
      },


      5: {
        background:
          "linear-gradient(145deg,#6366F1,#4338CA)",

        border:
          "rgba(79,70,229,0.45)",

        shadow:
          "0 6px 18px rgba(79,70,229,0.28)",
      },
    };

    return styles[intensity];
  };


  return (
    <div
      className="
        relative
        overflow-hidden

        rounded-[28px]

        border
        border-slate-200/80

        bg-gradient-to-br
        from-white
        via-[#F8FAFC]
        to-indigo-50/70

        p-4
        sm:p-5
        lg:p-6

        shadow-[0_15px_45px_-20px_rgba(15,23,42,0.16)]

        transition-all
        duration-500

        hover:shadow-[0_20px_55px_-20px_rgba(79,70,229,0.18)]
      "
    >

      {/* ======================================================
          MOVING BACKGROUND ORBS
      ======================================================= */}

      <div
        className="
          pointer-events-none

          absolute
          -top-24
          -right-20

          h-64
          w-64

          rounded-full

          bg-indigo-300/20

          blur-3xl

          heatmap-orb-one
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          -bottom-28
          -left-20

          h-64
          w-64

          rounded-full

          bg-orange-300/15

          blur-3xl

          heatmap-orb-two
        "
      />


      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        className="
          relative
          z-10

          flex
          items-center
          justify-between

          gap-3

          mb-5
        "
      >

        <div className="min-w-0">

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                relative

                flex
                h-2
                w-2

                items-center
                justify-center
              "
            >

              <span
                className="
                  absolute
                  inset-0

                  rounded-full

                  bg-indigo-400/40

                  heatmap-ring
                "
              />

              <span
                className="
                  relative

                  h-1.5
                  w-1.5

                  rounded-full

                  bg-indigo-500

                  shadow-[0_0_8px_rgba(99,102,241,0.65)]
                "
              />

            </span>


            <span
              className="
                text-[9px]
                sm:text-[10px]

                font-black

                uppercase

                tracking-[0.18em]

                bg-gradient-to-r
                from-orange-600
                via-amber-600
                to-indigo-600

                bg-clip-text
                text-transparent
              "
            >
              Sales Activity
            </span>

          </div>


          <h4
            className="
              mt-1

              text-[17px]
              sm:text-lg

              font-black

              tracking-tight

              text-slate-800
            "
          >
            Weekly Sales Heatmap
          </h4>

        </div>


        {/* ====================================================
            MINI LEGEND
        ===================================================== */}

        <div
          className="
            flex
            flex-shrink-0
            items-center
            gap-2

            rounded-2xl

            border
            border-slate-200/70

            bg-white/80

            px-3
            py-2

            shadow-sm

            backdrop-blur-sm
          "
        >

          <div
            className="
              flex
              items-center
              -space-x-1
            "
          >

            <span
              className="
                h-2.5
                w-2.5

                rounded-full

                bg-orange-300

                ring-2
                ring-white
              "
            />

            <span
              className="
                h-2.5
                w-2.5

                rounded-full

                bg-indigo-500

                ring-2
                ring-white
              "
            />

          </div>


          <span
            className="
              hidden
              sm:block

              text-[8px]

              font-black

              uppercase

              tracking-wider

              text-slate-500
            "
          >
            Activity
          </span>

        </div>

      </div>


      {/* ======================================================
          HEATMAP BOARD
      ======================================================= */}

      <div
        className="
          relative
          z-10

          rounded-[22px]

          border
          border-white

          bg-white/70

          p-2.5
          sm:p-3

          shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_20px_rgba(15,23,42,0.04)]

          backdrop-blur-md
        "
      >

        {/* Top shine */}

        <div
          className="
            pointer-events-none

            absolute
            top-0
            left-10
            right-10

            h-px

            bg-gradient-to-r
            from-transparent
            via-indigo-200
            to-transparent
          "
        />


        {/* ====================================================
            MOBILE SCROLL
        ===================================================== */}

        <div
          className="
            overflow-x-auto
            overflow-y-hidden

            scrollbar-none
          "
        >

          <div
            className="
              min-w-[500px]

              sm:min-w-0
            "
          >

            {/* ==================================================
                HOURS
            =================================================== */}

            <div
              className="
                grid

                grid-cols-[38px_repeat(15,minmax(24px,1fr))]

                sm:grid-cols-[48px_repeat(15,minmax(28px,1fr))]

                gap-[4px]
                sm:gap-1

                mb-2
              "
            >

              <div />

              {hours.map((hour) => (

                <div
                  key={hour}
                  className="
                    text-center

                    text-[7px]
                    sm:text-[9px]

                    font-black

                    text-slate-400

                    whitespace-nowrap
                  "
                >
                  {formatHour(hour)}
                </div>

              ))}

            </div>


            {/* ==================================================
                ROWS
            =================================================== */}

            <div
              className="
                space-y-[4px]
                sm:space-y-1
              "
            >

              {days.map((day, dayIndex) => (

                <div
                  key={day.label}
                  className="
                    group/day

                    grid

                    grid-cols-[38px_repeat(15,minmax(24px,1fr))]

                    sm:grid-cols-[48px_repeat(15,minmax(28px,1fr))]

                    gap-[4px]
                    sm:gap-1

                    items-center
                  "
                >

                  {/* ==================================================
                      DAY LABEL
                  =================================================== */}

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <span
                      className="
                        hidden
                        sm:block

                        h-1.5
                        w-1.5

                        rounded-full

                        bg-slate-300

                        transition-all
                        duration-300

                        group-hover/day:bg-indigo-500
                        group-hover/day:scale-125
                      "
                    />

                    <span
                      className="
                        text-[8px]
                        sm:text-[9px]

                        font-black

                        uppercase

                        tracking-wider

                        text-slate-400

                        transition-all
                        duration-300

                        group-hover/day:text-slate-700
                      "
                    >

                      <span className="sm:hidden">
                        {day.short}
                      </span>

                      <span className="hidden sm:inline">
                        {day.label}
                      </span>

                    </span>

                  </div>


                  {/* ==================================================
                      CELLS
                  =================================================== */}

                  {hours.map((hour, hourIndex) => {

                    const sales = getCell(
                      dayIndex + 1,
                      hour
                    );

                    const intensity =
                      getIntensity(sales);

                    const style =
                      getCellStyle(intensity);

                    return (
                      <div
                        key={`${day.label}-${hour}`}
                        title={
                          sales > 0
                            ? `${day.label} ${formatHour(hour)} — ₹${Math.round(sales)}`
                            : `${day.label} ${formatHour(hour)} — No sales`
                        }
                        className={`
                          heatmap-tile

                          relative

                          h-[29px]
                          sm:h-[34px]

                          rounded-[8px]
                          sm:rounded-[10px]

                          border

                          overflow-hidden

                          cursor-pointer

                          transition-all
                          duration-300

                          hover:z-30
                          hover:scale-[1.12]
                          hover:-translate-y-0.5

                          ${
                            intensity >= 4
                              ? "heatmap-hot"
                              : ""
                          }

                          ${
                            intensity === 5
                              ? "heatmap-peak"
                              : ""
                          }
                        `}
                        style={{
                          background:
                            style.background,

                          borderColor:
                            style.border,

                          boxShadow:
                            style.shadow,

                          "--delay":
                            `${(dayIndex * 15 + hourIndex) * 55}ms`,
                        }}
                      >

                        {/* ==========================================
                            VALUE
                        =========================================== */}

                        {sales > 0 && (
                          <span
                            className={`
                              absolute
                              inset-0

                              flex
                              items-center
                              justify-center

                              text-[6px]
                              sm:text-[8px]

                              font-black

                              ${
                                intensity >= 4
                                  ? "text-white"
                                  : intensity >= 3
                                  ? "text-indigo-700"
                                  : "text-orange-700"
                              }
                            `}
                          >
                            {Math.round(sales)}
                          </span>
                        )}


                        {/* ==========================================
                            MOVING LIGHT
                        =========================================== */}

                        {sales > 0 && (
                          <span
                            className="
                              pointer-events-none

                              absolute
                              top-0
                              bottom-0
                              -left-full

                              w-1/2

                              bg-gradient-to-r
                              from-transparent
                              via-white/35
                              to-transparent

                              heatmap-light
                            "
                          />
                        )}

                      </div>
                    );

                  })}

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          LEGEND
      ======================================================= */}

      <div
        className="
          relative
          z-10

          flex
          items-center
          justify-between

          mt-4

          pt-3

          border-t
          border-slate-200/70
        "
      >

        <span
          className="
            text-[8px]
            sm:text-[9px]

            font-black

            uppercase

            tracking-wider

            text-slate-400
          "
        >
          Low
        </span>


        <div
          className="
            flex
            items-center
            gap-1.5
          "
        >

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-slate-100

              border
              border-slate-200
            "
          />

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-orange-100
            "
          />

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-orange-300
            "
          />

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-indigo-300
            "
          />

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-indigo-400
            "
          />

          <span
            className="
              h-2.5
              w-2.5

              rounded-[4px]

              bg-indigo-600

              shadow-[0_0_8px_rgba(79,70,229,0.3)]
            "
          />

        </div>


        <span
          className="
            text-[8px]
            sm:text-[9px]

            font-black

            uppercase

            tracking-wider

            text-slate-400
          "
        >
          High
        </span>

      </div>


      {/* ======================================================
          ANIMATIONS
      ======================================================= */}

      <style>
        {`

          /* ==================================================
             BACKGROUND ORB 1
          ================================================== */

          @keyframes heatmapOrbOne {

            0%,
            100% {
              transform:
                translate3d(0, 0, 0)
                scale(1);
            }

            50% {
              transform:
                translate3d(-18px, 12px, 0)
                scale(1.08);
            }

          }


          .heatmap-orb-one {
            animation:
              heatmapOrbOne
              8s
              ease-in-out
              infinite;
          }


          /* ==================================================
             BACKGROUND ORB 2
          ================================================== */

          @keyframes heatmapOrbTwo {

            0%,
            100% {
              transform:
                translate3d(0, 0, 0)
                scale(1);
            }

            50% {
              transform:
                translate3d(20px, -14px, 0)
                scale(1.1);
            }

          }


          .heatmap-orb-two {
            animation:
              heatmapOrbTwo
              9s
              ease-in-out
              infinite;
          }


          /* ==================================================
             HEADER DOT
          ================================================== */

          @keyframes heatmapRing {

            0% {
              transform: scale(1);
              opacity: 0.55;
            }

            70% {
              transform: scale(2.5);
              opacity: 0;
            }

            100% {
              transform: scale(2.5);
              opacity: 0;
            }

          }


          .heatmap-ring {
            animation:
              heatmapRing
              2.3s
              ease-out
              infinite;
          }


          /* ==================================================
             MOBILE TILE FLOAT
          ================================================== */

          @keyframes mobileHeatmapFloat {

            0%,
            100% {
              transform:
                translateY(0)
                scale(1);
            }

            50% {
              transform:
                translateY(-1px)
                scale(1.035);
            }

          }


          /* ==================================================
             STRONG CELLS
          ================================================== */

          @keyframes heatmapHot {

            0%,
            100% {
              filter:
                brightness(1)
                saturate(1);
            }

            50% {
              filter:
                brightness(1.08)
                saturate(1.08);
            }

          }


          .heatmap-hot {
            animation:
              heatmapHot
              3.2s
              ease-in-out
              infinite;
          }


          /* ==================================================
             PEAK CELLS
          ================================================== */

          @keyframes heatmapPeak {

            0%,
            100% {
              box-shadow:
                0 5px 14px
                rgba(79,70,229,0.20);
            }

            50% {
              box-shadow:
                0 7px 22px
                rgba(79,70,229,0.38);
            }

          }


          .heatmap-peak {
            animation:
              heatmapPeak
              2.4s
              ease-in-out
              infinite;
          }


          /* ==================================================
             MOVING LIGHT
          ================================================== */

          @keyframes heatmapLight {

            0% {
              left: -70%;
              opacity: 0;
            }

            15% {
              opacity: 0.35;
            }

            45% {
              opacity: 0;
            }

            100% {
              left: 130%;
              opacity: 0;
            }

          }


          .heatmap-light {
            animation:
              heatmapLight
              4.5s
              ease-in-out
              infinite;
          }


          /* ==================================================
             MOBILE ANIMATION
          ================================================== */

          @media (max-width: 767px) {

            .heatmap-tile {
              animation:
                mobileHeatmapFloat
                3.8s
                ease-in-out
                infinite;

              animation-delay:
                var(--delay);
            }

            .heatmap-hot {
              animation:
                mobileHeatmapFloat
                3.2s
                ease-in-out
                infinite;

              animation-delay:
                var(--delay);
            }

            .heatmap-peak {
              animation:
                heatmapPeak,
                mobileHeatmapFloat;

              animation-duration:
                2.4s,
                3.8s;

              animation-timing-function:
                ease-in-out,
                ease-in-out;

              animation-iteration-count:
                infinite,
                infinite;

              animation-delay:
                var(--delay),
                var(--delay);
            }

            .heatmap-light {
              animation-duration:
                5.5s;
            }

          }


          /* ==================================================
             REDUCED MOTION
          ================================================== */

          @media (prefers-reduced-motion: reduce) {

            .heatmap-orb-one,
            .heatmap-orb-two,
            .heatmap-ring,
            .heatmap-tile,
            .heatmap-hot,
            .heatmap-peak,
            .heatmap-light {
              animation: none !important;
            }

          }

        `}
      </style>

    </div>
  );
}

export default SalesHeatmap;