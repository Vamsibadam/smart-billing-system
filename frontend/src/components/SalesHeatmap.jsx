function SalesHeatmap({ data }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hours = [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
  ];
  
  const maxSales = Math.max(...data.map((item) => Number(item.sales)), 1);

  const getCell = (weekday, hour) => {
    const item = data.find((d) => d.weekday === weekday && d.hour === hour);
    return item ? Number(item.sales) : 0;
  };

  const formatHour = (hour) => {
    if (hour === 0) return "12AM";
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return "12PM";
    return `${hour - 12}PM`;
  };

  return (
    <div
      className="
      relative
      overflow-hidden
      bg-gradient-to-tr from-orange-100/40 via-slate-50 to-indigo-300/60
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
      {/* Enhanced custom ambient glowing spots - emphasizing the orange/amber surge from bottom-left */}
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-300/10 via-purple-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
            Hourly Density Analysis
          </span>
          <h4 className="text-lg font-black tracking-tight text-slate-800 mt-0.5">
            Weekly Sales Heatmap
          </h4>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 border border-slate-100 shadow-3xs rounded-xl text-slate-500 text-[10px] font-bold">
          <span>Matrix Range: 10AM - 12AM</span>
        </div>
      </div>

      {/* Table Scroll Window */}
      <div className="overflow-x-auto relative z-10 scrollbar-none pb-2">
        <table className="border-separate border-spacing-[5px] min-w-full">
          <thead>
            <tr>
              <th className="w-12" />
              {hours.map((hour) => (
                <th
                  key={hour}
                  className="
                  text-[10px]
                  font-black
                  tracking-wider
                  text-slate-400
                  px-1
                  pb-2
                  text-center
                  min-w-[34px]
                  "
                >
                  {formatHour(hour)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map((day, dayIndex) => (
              <tr key={day}>
                <td
                  className="
                  text-[10px]
                  font-black
                  text-slate-400
                  pr-3
                  text-right
                  uppercase
                  tracking-wider
                  "
                >
                  {day}
                </td>

                {hours.map((hour) => {
                  const sales = getCell(dayIndex + 1, hour);
                  const ratio = sales / maxSales;

                  // Sophisticated grid matrix block structures
                  let bgColor = "rgba(255, 255, 255, 0.45)"; // Frosted translucent cell for empty space
                  let textColor = "text-slate-400 font-medium";
                  let borderStyle = "border border-lightgray/60 shadow-3xs";

                  if (sales > 0) {
                    borderStyle = "border border-transparent";
                    if (ratio <= 0.2) {
                      bgColor = "#FFEDD5"; // Light peach orange
                      textColor = "text-orange-700 font-bold";
                    } else if (ratio <= 0.4) {
                      bgColor = "#FED7AA"; // Warm sunset orange
                      textColor = "text-orange-800 font-bold";
                    } else if (ratio <= 0.6) {
                      bgColor = "#C7D2FE"; // Blending purple-indigo transition block
                      textColor = "text-indigo-800 font-extrabold";
                    } else if (ratio <= 0.8) {
                      bgColor = "#818CF8"; // Rich violet
                      textColor = "text-white font-black";
                    } else {
                      bgColor = "#4F46E5"; // Deep peak indigo
                      textColor = "text-white font-black";
                    }
                  }

                  return (
                    <td key={`${day}-${hour}`} className="p-0">
                      <div
                        title={`Sales Volume: ₹${sales}`}
                        className={`
                        w-[34px]
                        h-[34px]
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-[9px]
                        tracking-tighter
                        cursor-pointer
                        transition-all
                        duration-300
                        hover:scale-115
                        hover:shadow-md
                        hover:-translate-y-0.5
                        hover:z-20
                        ${textColor}
                        ${borderStyle}
                        `}
                        style={{ backgroundColor: sales > 0 ? bgColor : undefined }}
                      >
                        {sales > 0 ? Math.round(sales) : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Scale Legend */}
      <div
        className="
        flex
        justify-end
        items-center
        gap-1.5
        mt-4
        pt-3
        border-t border-slate-200/40
        text-[10px]
        font-bold
        tracking-wider
        text-slate-400
        uppercase
        relative
        z-10
        "
      >
        <span>Low</span>
        <div className="w-3 h-3 rounded-md bg-white/50 border border-white/80 shadow-3xs" />
        <div className="w-3 h-3 rounded-md bg-[#FFEDD5] shadow-3xs" />
        <div className="w-3 h-3 rounded-md bg-[#FED7AA] shadow-3xs" />
        <div className="w-3 h-3 rounded-md bg-[#C7D2FE] shadow-3xs" />
        <div className="w-3 h-3 rounded-md bg-[#818CF8] shadow-3xs" />
        <div className="w-3 h-3 rounded-md bg-[#4F46E5] shadow-3xs" />
        <span>High</span>
      </div>
    </div>
  );
}

export default SalesHeatmap;
