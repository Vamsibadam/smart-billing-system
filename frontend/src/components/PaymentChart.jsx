import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  CreditCard,
  Download,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Banknote,
  Smartphone,
  WalletCards,
} from "lucide-react";

// ============================================================
// COLORS
// ============================================================

const CHART_COLORS = [
  "#6366F1",
  "#F97316",
  "#14B8A6",
  "#0EA5E9",
  "#EC4899",
];

// ============================================================
// PAYMENT ICON
// ============================================================

const getPaymentIcon = (method) => {
  const value = String(method || "").toLowerCase();

  if (value.includes("cash")) {
    return Banknote;
  }

  if (
    value.includes("upi") ||
    value.includes("phone") ||
    value.includes("paytm") ||
    value.includes("google") ||
    value.includes("gpay")
  ) {
    return Smartphone;
  }

  if (
    value.includes("card") ||
    value.includes("credit") ||
    value.includes("debit")
  ) {
    return CreditCard;
  }

  return WalletCards;
};

// ============================================================
// PAYMENT LABEL
// ============================================================

const getPaymentLabel = (method) => {
  if (!method) return "Payment";

  return String(method).replace(
    /\b\w/g,
    (char) => char.toUpperCase()
  );
};

// ============================================================
// COMPONENT
// ============================================================

function PaymentChart({
  data = [],
  todayExpense = 0,
}) {
  // ==========================================================
  // TOTAL
  // ==========================================================

  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  // ==========================================================
  // FORMAT MONEY
  // ==========================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  // ==========================================================
  // CANVAS ROUNDED RECTANGLE
  // ==========================================================

  const roundedRect = (
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) => {
    const r = Math.min(
      radius,
      width / 2,
      height / 2
    );

    ctx.beginPath();

    ctx.moveTo(x + r, y);

    ctx.lineTo(
      x + width - r,
      y
    );

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + r
    );

    ctx.lineTo(
      x + width,
      y + height - r
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    ctx.lineTo(
      x + r,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - r
    );

    ctx.lineTo(
      x,
      y + r
    );

    ctx.quadraticCurveTo(
      x,
      y,
      x + r,
      y
    );

    ctx.closePath();
  };

  // ==========================================================
  // CANVAS TEXT
  // ==========================================================

  const drawText = (
    ctx,
    text,
    x,
    y,
    options = {}
  ) => {
    const {
      size = 14,
      weight = 600,
      color = "#172033",
      align = "left",
      baseline = "alphabetic",
      letterSpacing = 0,
    } = options;

    ctx.save();

    ctx.font =
      `${weight} ${size}px Arial, Helvetica, sans-serif`;

    ctx.fillStyle = color;

    ctx.textAlign = align;

    ctx.textBaseline = baseline;

    if (!letterSpacing) {
      ctx.fillText(
        String(text),
        x,
        y
      );

      ctx.restore();

      return;
    }

    let currentX = x;

    const characters =
      String(text).split("");

    characters.forEach(
      (character) => {
        ctx.fillText(
          character,
          currentX,
          y
        );

        currentX +=
          ctx.measureText(
            character
          ).width +
          letterSpacing;
      }
    );

    ctx.restore();
  };

  // ==========================================================
  // CANVAS PAYMENT ICON
  // ==========================================================

  const getCanvasIcon = (method) => {
    const value =
      String(method || "")
        .toLowerCase();

    if (value.includes("cash")) {
      return "₹";
    }

    if (
      value.includes("upi") ||
      value.includes("phone") ||
      value.includes("paytm") ||
      value.includes("google") ||
      value.includes("gpay")
    ) {
      return "⌁";
    }

    if (
      value.includes("card") ||
      value.includes("credit") ||
      value.includes("debit")
    ) {
      return "▣";
    }

    return "◈";
  };

  // ==========================================================
  // DOWNLOAD PAYMENT REPORT
  //
  // IMPORTANT:
  // This is intentionally independent from the browser DOM.
  // It creates a clean report instead of taking a screenshot
  // of the liquid-glass UI.
  // ==========================================================

  const downloadChart = () => {
    try {
      // ======================================================
      // EXPORT SIZE
      //
      // 1200 x 700 gives a much better report proportion.
      // ======================================================

      const WIDTH = 1200;
      const HEIGHT = 700;

      const SCALE = 2;

      const canvas =
        document.createElement("canvas");

      canvas.width =
        WIDTH * SCALE;

      canvas.height =
        HEIGHT * SCALE;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas context unavailable"
        );
      }

      ctx.scale(
        SCALE,
        SCALE
      );

      // ======================================================
      // BACKGROUND
      // ======================================================

      const background =
        ctx.createLinearGradient(
          0,
          0,
          WIDTH,
          HEIGHT
        );

      background.addColorStop(
        0,
        "#F8FAFC"
      );

      background.addColorStop(
        0.55,
        "#FFFFFF"
      );

      background.addColorStop(
        1,
        "#F3F5FF"
      );

      ctx.fillStyle =
        background;

      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      // ======================================================
      // MAIN REPORT CARD
      // ======================================================

      roundedRect(
        ctx,
        20,
        20,
        WIDTH - 40,
        HEIGHT - 40,
        30
      );

      ctx.fillStyle =
        "#FFFFFF";

      ctx.fill();

      ctx.strokeStyle =
        "#E8ECF3";

      ctx.lineWidth = 1.5;

      ctx.stroke();

      // ======================================================
      // HEADER
      // ======================================================

      drawText(
        ctx,
        "PAYMENT ANALYTICS",
        55,
        62,
        {
          size: 12,
          weight: 900,
          color: "#94A3B8",
          letterSpacing: 2.8,
        }
      );

      drawText(
        ctx,
        "Revenue Flow",
        55,
        98,
        {
          size: 29,
          weight: 900,
          color: "#172033",
        }
      );

      drawText(
        ctx,
        new Date().toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        ),
        55,
        124,
        {
          size: 12,
          weight: 700,
          color: "#94A3B8",
        }
      );

      // ======================================================
      // MAIN LAYOUT
      //
      // Left  = chart
      // Right = payments
      // ======================================================

      const LEFT_X = 55;
      const LEFT_Y = 150;

      const LEFT_WIDTH = 550;
      const LEFT_HEIGHT = 490;

      const RIGHT_X = 635;
      const RIGHT_WIDTH = 510;

      // ======================================================
      // LEFT CHART CARD
      // ======================================================

      roundedRect(
        ctx,
        LEFT_X,
        LEFT_Y,
        LEFT_WIDTH,
        LEFT_HEIGHT,
        28
      );

      ctx.fillStyle =
        "#FBFCFE";

      ctx.fill();

      ctx.strokeStyle =
        "#EEF1F6";

      ctx.lineWidth = 1.5;

      ctx.stroke();

      // ======================================================
      // SUBTLE BLUE LIGHT
      // ======================================================

      const blueGlow =
        ctx.createRadialGradient(
          LEFT_X +
            LEFT_WIDTH -
            70,
          LEFT_Y + 55,
          10,
          LEFT_X +
            LEFT_WIDTH -
            70,
          LEFT_Y + 55,
          190
        );

      blueGlow.addColorStop(
        0,
        "rgba(99,102,241,0.09)"
      );

      blueGlow.addColorStop(
        1,
        "rgba(99,102,241,0)"
      );

      ctx.fillStyle =
        blueGlow;

      ctx.fillRect(
        LEFT_X,
        LEFT_Y,
        LEFT_WIDTH,
        LEFT_HEIGHT
      );

      // ======================================================
      // SUBTLE ORANGE LIGHT
      // ======================================================

      const orangeGlow =
        ctx.createRadialGradient(
          LEFT_X + 50,
          LEFT_Y +
            LEFT_HEIGHT -
            30,
          10,
          LEFT_X + 50,
          LEFT_Y +
            LEFT_HEIGHT -
            30,
          150
        );

      orangeGlow.addColorStop(
        0,
        "rgba(249,115,22,0.055)"
      );

      orangeGlow.addColorStop(
        1,
        "rgba(249,115,22,0)"
      );

      ctx.fillStyle =
        orangeGlow;

      ctx.fillRect(
        LEFT_X,
        LEFT_Y,
        LEFT_WIDTH,
        LEFT_HEIGHT
      );

      // ======================================================
      // DONUT POSITION
      // ======================================================

      const CENTER_X =
        LEFT_X +
        LEFT_WIDTH / 2;

      const CENTER_Y =
        LEFT_Y +
        LEFT_HEIGHT / 2 +
        5;

      const OUTER_RADIUS = 132;
      const INNER_RADIUS = 82;

      // ======================================================
      // DONUT
      // ======================================================

      if (total > 0) {
        let currentAngle =
          -Math.PI / 2;

        data.forEach(
          (item, index) => {
            const amount =
              Number(
                item.amount || 0
              );

            const percentage =
              amount / total;

            const segmentAngle =
              percentage *
              Math.PI *
              2;

            // Small clean separation
            // between segments.

            const gap =
              Math.min(
                0.028,
                segmentAngle * 0.10
              );

            const startAngle =
              currentAngle +
              gap;

            const endAngle =
              currentAngle +
              segmentAngle -
              gap;

            if (
              endAngle >
              startAngle
            ) {
              ctx.beginPath();

              ctx.arc(
                CENTER_X,
                CENTER_Y,
                OUTER_RADIUS,
                startAngle,
                endAngle
              );

              ctx.arc(
                CENTER_X,
                CENTER_Y,
                INNER_RADIUS,
                endAngle,
                startAngle,
                true
              );

              ctx.closePath();

              ctx.fillStyle =
                CHART_COLORS[
                  index %
                    CHART_COLORS.length
                ];

              ctx.fill();
            }

            currentAngle +=
              segmentAngle;
          }
        );
      } else {
        ctx.beginPath();

        ctx.arc(
          CENTER_X,
          CENTER_Y,
          OUTER_RADIUS,
          0,
          Math.PI * 2
        );

        ctx.arc(
          CENTER_X,
          CENTER_Y,
          INNER_RADIUS,
          Math.PI * 2,
          0,
          true
        );

        ctx.closePath();

        ctx.fillStyle =
          "#E2E8F0";

        ctx.fill();
      }

      // ======================================================
      // DONUT CENTER
      // ======================================================

      ctx.beginPath();

      ctx.arc(
        CENTER_X,
        CENTER_Y,
        INNER_RADIUS - 2,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "#FFFFFF";

      ctx.fill();

      // ======================================================
      // CENTER TEXT
      // ======================================================

      drawText(
        ctx,
        "TOTAL SALES",
        CENTER_X,
        CENTER_Y - 13,
        {
          size: 11,
          weight: 900,
          color: "#94A3B8",
          align: "center",
          letterSpacing: 2,
        }
      );

      drawText(
        ctx,
        `₹${formatMoney(total)}`,
        CENTER_X,
        CENTER_Y + 27,
        {
          size: 27,
          weight: 900,
          color: "#172033",
          align: "center",
        }
      );

      // ======================================================
      // TODAY BADGE
      // ======================================================

      roundedRect(
        ctx,
        CENTER_X - 46,
        CENTER_Y + 46,
        92,
        29,
        15
      );

      ctx.fillStyle =
        "#ECFDF5";

      ctx.fill();

      ctx.strokeStyle =
        "#BBF7D0";

      ctx.lineWidth = 1;

      ctx.stroke();

      drawText(
        ctx,
        "↗  Today",
        CENTER_X,
        CENTER_Y + 66,
        {
          size: 10,
          weight: 900,
          color: "#059669",
          align: "center",
        }
      );

      // ======================================================
      // RIGHT TITLE
      // ======================================================

      drawText(
        ctx,
        "PAYMENT MIX",
        RIGHT_X,
        174,
        {
          size: 12,
          weight: 900,
          color: "#94A3B8",
          letterSpacing: 2,
        }
      );

      drawText(
        ctx,
        "Today's collection",
        RIGHT_X,
        197,
        {
          size: 12,
          weight: 600,
          color: "#94A3B8",
        }
      );

      // ======================================================
      // PAYMENT CARDS
      //
      // Maximum 5 payment methods.
      // The spacing is calculated so everything fits.
      // ======================================================

      const paymentCount =
        Math.min(data.length, 5);

      const PAYMENT_START_Y = 214;

      const PAYMENT_HEIGHT = 62;

      const PAYMENT_GAP = 9;

      data
        .slice(0, 5)
        .forEach(
          (item, index) => {
            const y =
              PAYMENT_START_Y +
              index *
                (
                  PAYMENT_HEIGHT +
                  PAYMENT_GAP
                );

            const color =
              CHART_COLORS[
                index %
                  CHART_COLORS.length
              ];

            // ------------------------------------------------
            // CARD
            // ------------------------------------------------

            roundedRect(
              ctx,
              RIGHT_X,
              y,
              RIGHT_WIDTH,
              PAYMENT_HEIGHT,
              18
            );

            ctx.fillStyle =
              "#FFFFFF";

            ctx.fill();

            ctx.strokeStyle =
              "#EDF0F5";

            ctx.lineWidth = 1;

            ctx.stroke();

            // ------------------------------------------------
            // ICON BOX
            // ------------------------------------------------

            roundedRect(
              ctx,
              RIGHT_X + 15,
              y + 10,
              42,
              42,
              13
            );

            ctx.fillStyle =
              color + "12";

            ctx.fill();

            ctx.strokeStyle =
              color + "35";

            ctx.stroke();

            // ------------------------------------------------
            // ICON
            // ------------------------------------------------

            drawText(
              ctx,
              getCanvasIcon(
                item.payment_method
              ),
              RIGHT_X + 36,
              y + 31,
              {
                size: 18,
                weight: 900,
                color,
                align: "center",
                baseline: "middle",
              }
            );

            // ------------------------------------------------
            // NAME
            // ------------------------------------------------

            drawText(
              ctx,
              getPaymentLabel(
                item.payment_method
              ),
              RIGHT_X + 73,
              y + 27,
              {
                size: 14,
                weight: 900,
                color: "#475569",
              }
            );

            drawText(
              ctx,
              "Payment",
              RIGHT_X + 73,
              y + 44,
              {
                size: 9,
                weight: 600,
                color: "#94A3B8",
              }
            );

            // ------------------------------------------------
            // AMOUNT
            // ------------------------------------------------

            drawText(
              ctx,
              `₹${formatMoney(
                item.amount
              )}`,
              RIGHT_X +
                RIGHT_WIDTH -
                18,
              y + 32,
              {
                size: 15,
                weight: 900,
                color: "#172033",
                align: "right",
                baseline: "middle",
              }
            );
          }
        );

      // ======================================================
      // EXPENSE CARD
      // ======================================================

      const EXPENSE_Y =
        PAYMENT_START_Y +
        paymentCount *
          (
            PAYMENT_HEIGHT +
            PAYMENT_GAP
          ) +
        5;

      const EXPENSE_HEIGHT = 70;

      roundedRect(
        ctx,
        RIGHT_X,
        EXPENSE_Y,
        RIGHT_WIDTH,
        EXPENSE_HEIGHT,
        20
      );

      const expenseGradient =
        ctx.createLinearGradient(
          RIGHT_X,
          EXPENSE_Y,
          RIGHT_X +
            RIGHT_WIDTH,
          EXPENSE_Y
        );

      expenseGradient.addColorStop(
        0,
        "#10172C"
      );

      expenseGradient.addColorStop(
        1,
        "#171F3A"
      );

      ctx.fillStyle =
        expenseGradient;

      ctx.fill();

      // ======================================================
      // EXPENSE ICON
      // ======================================================

      roundedRect(
        ctx,
        RIGHT_X + 16,
        EXPENSE_Y + 14,
        42,
        42,
        13
      );

      ctx.fillStyle =
        "rgba(255,255,255,.09)";

      ctx.fill();

      drawText(
        ctx,
        "₹",
        RIGHT_X + 37,
        EXPENSE_Y + 35,
        {
          size: 18,
          weight: 900,
          color: "#FDBA74",
          align: "center",
          baseline: "middle",
        }
      );

      // ======================================================
      // EXPENSE TEXT
      // ======================================================

      drawText(
        ctx,
        "TODAY'S EXPENSE",
        RIGHT_X + 73,
        EXPENSE_Y + 27,
        {
          size: 9,
          weight: 900,
          color: "#94A3B8",
          letterSpacing: 1.3,
        }
      );

      drawText(
        ctx,
        `₹${formatMoney(
          todayExpense
        )}`,
        RIGHT_X + 73,
        EXPENSE_Y + 50,
        {
          size: 17,
          weight: 900,
          color: "#FFFFFF",
        }
      );

      // ======================================================
      // EXPENSE ARROW
      // ======================================================

      ctx.beginPath();

      ctx.arc(
        RIGHT_X +
          RIGHT_WIDTH -
          37,
        EXPENSE_Y + 35,
        17,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(255,255,255,.09)";

      ctx.fill();

      drawText(
        ctx,
        "↗",
        RIGHT_X +
          RIGHT_WIDTH -
          37,
        EXPENSE_Y + 35,
        {
          size: 17,
          weight: 600,
          color: "#94A3B8",
          align: "center",
          baseline: "middle",
        }
      );

      // ======================================================
      // SMALL FOOTER
      // ======================================================

      drawText(
        ctx,
        "NexBill • Payment Summary",
        55,
        HEIGHT - 38,
        {
          size: 9,
          weight: 700,
          color: "#CBD5E1",
        }
      );

      // ======================================================
      // EXPORT
      // ======================================================

      const dataUrl =
        canvas.toDataURL(
          "image/png"
        );

      const link =
        document.createElement(
          "a"
        );

      const date =
        new Date()
          .toLocaleDateString(
            "en-GB"
          )
          .replace(
            /\//g,
            "-"
          );

      link.download =
        `NexBill_PaymentSummary_${date}.png`;

      link.href =
        dataUrl;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

    } catch (error) {
      console.error(
        "Payment chart download failed:",
        error
      );

      alert(
        "Unable to download payment report."
      );
    }
  };

  // ==========================================================
  // DASHBOARD UI
  //
  // THIS PART IS LEFT AS YOUR CURRENT DESIGN.
  // ==========================================================

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/80
        bg-white/55
        shadow-[0_18px_55px_-25px_rgba(15,23,42,0.22)]
        backdrop-blur-2xl
        transition-all
        duration-500
        hover:shadow-[0_24px_65px_-25px_rgba(15,23,42,0.28)]
      "
    >

      {/* LIQUID BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-28
          h-72
          w-72
          rounded-full
          bg-indigo-300/15
          blur-[75px]
          transition-all
          duration-700
          group-hover:scale-110
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-28
          -left-24
          h-64
          w-64
          rounded-full
          bg-orange-300/15
          blur-[75px]
          transition-all
          duration-700
          group-hover:scale-110
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-[28%]
          top-[-80px]
          h-40
          w-64
          rounded-full
          bg-white/80
          blur-3xl
        "
      />

      {/* TOP REFLECTION */}

      <div
        className="
          pointer-events-none
          absolute
          left-6
          right-6
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          p-5
          sm:p-6
        "
      >

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                relative
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-[16px]
                border
                border-white/90
                bg-white/70
                text-indigo-600
                shadow-[inset_0_1px_3px_rgba(255,255,255,.9),0_6px_18px_rgba(15,23,42,.06)]
                backdrop-blur-xl
              "
            >

              <div
                className="
                  absolute
                  -right-2
                  -top-2
                  h-7
                  w-7
                  rounded-full
                  bg-indigo-300/30
                  blur-lg
                "
              />

              <CreditCard
                size={18}
                strokeWidth={1.8}
                className="
                  relative
                  z-10
                "
              />

            </div>

            <div className="min-w-0">

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-slate-400
                "
              >
                Payment Analytics
              </p>

              <h3
                className="
                  mt-0.5
                  text-[17px]
                  font-black
                  tracking-tight
                  text-slate-800
                "
              >
                Revenue Flow
              </h3>

            </div>

          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                hidden
                items-center
                gap-1.5
                rounded-full
                border
                border-white/90
                bg-white/60
                px-2.5
                py-1.5
                shadow-sm
                backdrop-blur-xl
                sm:flex
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                  shadow-[0_0_8px_rgba(16,185,129,.5)]
                "
              />

              <span
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Live
              </span>

            </div>

            <button
              onClick={downloadChart}
              title="Download payment summary"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/90
                bg-white/65
                text-slate-500
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-200
                hover:bg-white
                hover:text-slate-800
                hover:shadow-md
                active:scale-95
              "
            >
              <Download size={15} />
            </button>

          </div>

        </div>

        {/* DATE */}

        <p
          className="
            mt-3
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          {new Date().toLocaleDateString(
            "en-IN",
            {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}
        </p>

        {/* ====================================================
            MAIN
        ===================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-4
            md:grid-cols-[1.15fr_0.85fr]
            md:items-center
          "
        >

          {/* ==================================================
              CHART
          =================================================== */}

          <div
            className="
              relative
              h-[270px]
              min-w-0
              overflow-hidden
              rounded-[26px]
              border
              border-white/80
              bg-white/35
              shadow-[inset_0_1px_3px_rgba(255,255,255,.9)]
              backdrop-blur-xl
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-20
                h-40
                w-40
                rounded-full
                bg-indigo-300/10
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-16
                -left-10
                h-32
                w-32
                rounded-full
                bg-orange-300/10
                blur-3xl
              "
            />

            <div
              className="
                absolute
                inset-0
              "
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="payment_method"
                    cx="50%"
                    cy="50%"
                    innerRadius={76}
                    outerRadius={101}
                    paddingAngle={4}
                    cornerRadius={8}
                    stroke="none"
                    animationBegin={100}
                    animationDuration={900}
                  >

                    {data.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            CHART_COLORS[
                              index %
                                CHART_COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "rgba(255,255,255,.92)",
                      backdropFilter:
                        "blur(18px)",
                      border:
                        "1px solid rgba(255,255,255,.8)",
                      borderRadius:
                        "16px",
                      boxShadow:
                        "0 15px 40px -15px rgba(15,23,42,.2)",
                      fontSize:
                        "11px",
                      fontWeight:
                        "700",
                    }}
                    itemStyle={{
                      color:
                        "#334155",
                    }}
                    cursor={{
                      fill:
                        "transparent",
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* CENTER */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                flex
                h-[124px]
                w-[124px]
                -translate-x-1/2
                -translate-y-1/2
                flex-col
                items-center
                justify-center
                rounded-full
                border
                border-white
                bg-white/85
                shadow-[inset_0_2px_5px_rgba(255,255,255,.95),0_12px_35px_-15px_rgba(15,23,42,.25)]
                backdrop-blur-2xl
              "
            >

              <span
                className="
                  absolute
                  left-[25px]
                  top-[19px]
                  h-3
                  w-7
                  rounded-full
                  bg-white
                  opacity-70
                  blur-sm
                "
              />

              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-400
                "
              >
                Total Sales
              </p>

              <p
                className="
                  mt-1
                  text-[20px]
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                ₹{formatMoney(total)}
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-1
                  rounded-full
                  border
                  border-emerald-100
                  bg-emerald-50
                  px-2
                  py-1
                "
              >

                <TrendingUp
                  size={9}
                  className="text-emerald-500"
                />

                <span
                  className="
                    text-[8px]
                    font-black
                    text-emerald-600
                  "
                >
                  Today
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              PAYMENT MIX
          =================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-2
            "
          >

            <div
              className="
                px-1
                pb-1
              "
            >

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-400
                "
              >
                Payment Mix
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-slate-400
                "
              >
                Today's collection
              </p>

            </div>

            {data.map(
              (item, index) => {

                const PaymentIcon =
                  getPaymentIcon(
                    item.payment_method
                  );

                return (
                  <div
                    key={index}
                    className="
                      group/payment
                      relative
                      flex
                      items-center
                      justify-between
                      overflow-hidden
                      rounded-[19px]
                      border
                      border-white/80
                      bg-white/55
                      px-3.5
                      py-2.5
                      shadow-[0_7px_22px_-16px_rgba(15,23,42,.22)]
                      backdrop-blur-xl
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-white/80
                      hover:shadow-[0_12px_25px_-15px_rgba(15,23,42,.25)]
                    "
                  >

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-5
                        -top-5
                        h-12
                        w-12
                        rounded-full
                        opacity-0
                        blur-xl
                        transition-opacity
                        duration-300
                        group-hover/payment:opacity-100
                      "
                      style={{
                        backgroundColor:
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ],
                      }}
                    />

                    <div
                      className="
                        relative
                        flex
                        min-w-0
                        items-center
                        gap-2.5
                      "
                    >

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-white
                          bg-white/75
                          shadow-sm
                        "
                        style={{
                          color:
                            CHART_COLORS[
                              index %
                                CHART_COLORS.length
                            ],
                        }}
                      >

                        <PaymentIcon
                          size={16}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            truncate
                            text-[15px]
                            font-black
                            capitalize
                            text-slate-600
                          "
                        >
                          {
                            item.payment_method
                          }
                        </p>

                        

                      </div>

                    </div>

                    <span
                      className="
                        relative
                        ml-2
                        shrink-0
                        text-xs
                        font-black
                        text-slate-800
                      "
                    >
                      ₹
                      {formatMoney(
                        item.amount
                      )}
                    </span>

                  </div>
                );
              }
            )}

            {/* EXPENSE */}

            <div
              className="
                relative
                mt-1
                overflow-hidden
                rounded-[20px]
                bg-slate-900
                px-3.5
                py-3
                text-white
                shadow-[0_12px_30px_-15px_rgba(15,23,42,.45)]
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-12
                  h-24
                  w-28
                  rounded-full
                  bg-indigo-400/15
                  blur-2xl
                "
              />

              <div
                className="
                  relative
                  flex
                  items-center
                  justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-xl
                      bg-white/10
                    "
                  >

                    <Wallet
                      size={14}
                      className="
                        text-orange-300
                      "
                    />

                  </div>

                  <div>

                    <p
                      className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-slate-400
                      "
                    >
                      Today's Expense
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-sm
                        font-black
                        text-white
                      "
                    >
                      ₹
                      {formatMoney(
                        todayExpense
                      )}
                    </p>

                  </div>

                </div>

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                  "
                >

                  <ArrowUpRight
                    size={12}
                    className="
                      text-slate-400
                    "
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PaymentChart;