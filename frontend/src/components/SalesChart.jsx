import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function SalesChart({ data }) {
  return (
    <div
      className="
      relative
      overflow-hidden
      bg-gradient-to-tr from-orange-300/40 via-slate-50 to-white-200/70
      backdrop-blur-md
      rounded-3xl
      p-6
      border border-white/80
      shadow-[0_4px_25px_-5px_rgba(249,115,22,0.04),0_16px_40px_-15px_rgba(0,0,0,0.06)]
      hover:shadow-[0_12px_40px_-6px_rgba(249,115,22,0.08),0_20px_50px_-10px_rgba(99,102,241,0.06)]
      hover:border-slate-200/80
      transition-all
      duration-500
      "
    >
      {/* Precision ambient background mesh glows matching the master layout system */}
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-300/10 via-purple-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <span className="text-[12px] font-black tracking-widest uppercase bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
            Performance Metrics
          </span>
          <h4 className="text-xl font-black tracking-tight text-slate-800 mt-0.5">
            Weekly Sales Trends
          </h4>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 border border-slate-100/80 shadow-3xs rounded-xl text-slate-400 text-[10px] font-black tracking-wide uppercase">
          7 Day Window
        </div>
      </div>

      {/* Responsive Chart Surface Container */}
      <div className="relative z-10 w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: -20, 
              bottom: 0,
            }}
          >
            {/* Custom linear gradient definitions mapping your chosen ecosystem tokens */}
            <defs>
              <linearGradient id="salesBarGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FED7AA" stopOpacity={0.9} />   {/* Soft bottom orange tint */}
                <stop offset="50%" stopColor="#C7D2FE" stopOpacity={0.95} /> {/* Middle transition purple-indigo */}
                <stop offset="100%" stopColor="#6366F1" stopOpacity={1} />   {/* Bold peak indigo crown */}
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#E2E8F0"
              opacity={0.45}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{
                fontSize: 15,
                fontWeight: 600,
                fill: "#738aaa",
                letterSpacing: "0.05em",
              }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />

            <YAxis
              tick={{
                fontSize: 15,
                fontWeight: 600,
                fill: "#718aae",
              }}
              tickLine={false}
              axisLine={false}
              dx={-4}
            />

            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.25)", radius: 14 }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.96)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                boxShadow: "0 12px 30px -5px rgba(0, 0, 0, 0.05)",
                fontSize: "11px",
                fontWeight: "800",
                color: "#1E293B",
                fontFamily: "inherit",
              }}
              itemStyle={{ color: "#4F46E5" }}
            />

            <Bar
              dataKey="sales"
              fill="url(#salesBarGradient)"
              maxBarSize={44} // Bold, premium data blocks
              radius={[10, 10, 0, 0]} 
              animationBegin={100}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesChart;
