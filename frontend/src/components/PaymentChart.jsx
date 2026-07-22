import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

// Vibrant gradient palette mapping configurations for the visual indicators
const VISUAL_COLORS = [
  "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", // Indigo to Purple (UPI)
  "linear-gradient(135deg, #0D9488 0%, #10B981 100%)", // Teal to Emerald (Cash)
  "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)", // Sky to Light Blue (Card)
  "linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)", // Orange to Amber (Voucher)
  "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)", // Rose to Pink (Others)
];

// Flat equivalent hex colors optimized specifically for SVG rendering nodes
const SVG_COLORS = ["#6366F1", "#14B8A6", "#0EA5E9", "#F59E0B", "#F43F5E"];


function PaymentChart({ data }) {
  const total = data.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const chartRef = useRef(null);
const downloadChart = async () => {
  if (!chartRef.current) return;

  try {
    const dataUrl = await toPng(chartRef.current, {
      cacheBust: true,
      pixelRatio: 3, // High quality
    });

    const link = document.createElement("a");

    link.download = `Payment Summary ${new Date().toLocaleDateString("en-IN")}.png`;

    link.href = dataUrl;

    link.click();
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div
      ref={chartRef}
      className="
      relative
      overflow-hidden
      bg-gradient-to-tr from-indigo-200/70 via-slate-50 to-orange-200/40
      backdrop-blur-md
      rounded-3xl
      p-6
      border border-white
      shadow-[0_4px_20px_-4px_rgba(99,102,241,0.05),0_16px_40px_-15px_rgba(0,0,0,0.06)]
      hover:shadow-[0_10px_40px_-6px_rgba(99,102,241,0.1),0_20px_50px_-12px_rgba(0,0,0,0.08)]
      hover:border-slate-200/80
      transition-all
      duration-500
      "
    >
      {/* Dynamic ambient background glow layers */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-300/10 via-purple-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-300/10 via-emerald-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          
          <span className="text-[15px] font-black tracking-widest uppercase bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <h4 className="text-lg font-black tracking-tight text-slate-800 mt-0.5">
            Revenue by Channels
          </h4>
        </div>
        <div className="flex items-center gap-3">

    <button
        onClick={downloadChart}
        className="
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-2xl
        bg-white
        border
        border-slate-200
        shadow-sm
        hover:bg-slate-50
        transition-all
        cursor-pointer
        "
    >
        <Download size={16}/>
        <span className="text-xs font-bold">
            Download
        </span>
    </button>

    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-slate-100 shadow-xs rounded-2xl">

        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>

        <span className="text-[10px] font-extrabold uppercase text-slate-600">
            Live Stream
        </span>

    </div>

</div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex items-center gap-8 mt-5 relative z-10">
        
        {/* Left Side: Centered Donut Area */}
        <div className="w-1/2 h-[210px] flex items-center justify-center relative">
          
          {/* Frosted Inner Center Badge */}
          <div className="absolute w-28 h-28 bg-white/70 backdrop-blur-md rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center pointer-events-none border border-white/60">
            <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Net Sales</span>
            <span className="text-lg font-black tracking-tight text-slate-800 mt-0.5">
              ₹{total > 99999 ? `${(total / 1000).toFixed(1)}k` : total.toLocaleString("en-IN")}
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="payment_method"
                innerRadius={68}
                outerRadius={88}
                paddingAngle={3}
                stroke="transparent"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={SVG_COLORS[index % SVG_COLORS.length]}
                    className="focus:outline-none hover:opacity-90 transition-all duration-300 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  borderRadius: "16px",
                  boxShadow: "0 12px 30px -5px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#0f172a"
                }}
                itemStyle={{ color: "#334155" }}
                cursor={{ fill: "transparent" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Legend Breakdown Rows */}
        <div className="w-1/2 flex flex-col justify-between h-[195px]">
          <div className="space-y-2 overflow-y-auto pr-1 max-h-[145px] scrollbar-none">
            {data.map((item, index) => (
              <div
                key={index}
                className="
                flex
                justify-between
                items-center
                px-3.5
                py-2.5
                bg-white/80
                backdrop-blur-xs
                border border-white/60
                rounded-2xl
                shadow-[0_2px_6px_rgba(0,0,0,0.01)]
                hover:bg-white
                hover:border-indigo-100
                hover:shadow-[0_4px_12px_rgba(99,102,241,0.05)]
                hover:scale-[1.02]
                group
                transition-all
                duration-300
                "
              >
                <div className="flex items-center gap-3">
                  {/* Premium Pill Indicator with CSS Gradient */}
                  <div
                    className="w-2 h-4 rounded-full transition-transform duration-300 group-hover:scale-y-110 shadow-xs"
                    style={{ background: VISUAL_COLORS[index % VISUAL_COLORS.length] }}
                  />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 capitalize transition-colors">
                    {item.payment_method}
                  </span>
                </div>
                <span className="text-xs font-black tracking-tight text-slate-700 group-hover:text-slate-900 transition-colors">
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          {/* Premium High-Contrast Total Summary Strip */}
          <div className="mt-2.5 p-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl flex items-center justify-between shadow-md shadow-indigo-950/10 border border-slate-800">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase pl-1">
              Aggregate Gross
            </span>
            <span className="text-sm font-black tracking-tight text-white pr-1">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PaymentChart;
