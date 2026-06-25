import {
  Trophy
} from "lucide-react";

function TopProducts({ products }) {
  const topFive = products.slice(0, 5);

  const getBadgeClass = (index) => {
    if (index === 0) return "bg-amber-100 text-amber-700 shadow-xs ring-1 ring-amber-200/50";
    if (index === 1) return "bg-slate-200/70 text-slate-700 shadow-xs ring-1 ring-slate-300/40";
    if (index === 2) return "bg-orange-100 text-orange-700 shadow-xs ring-1 ring-orange-200/50";
    return "bg-white/80 text-slate-500 border border-slate-200/60 shadow-3xs";
  };

  return (
    <div
      className="
      relative
      overflow-hidden
      bg-gradient-to-tr from-gray-100 via-slate-50 to-indigo-300/60
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
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-gradient-to-tr from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-300/10 via-purple-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-3xs">
            <Trophy size={16} className="text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
              Inventory Ranking
            </span>
            <h4 className="text-lg font-black tracking-tight text-slate-800 mt-0.5">
              Top Products
            </h4>
          </div>
        </div>
        <div className="flex items-center px-2.5 py-1 bg-white/90 border border-slate-100 shadow-3xs rounded-xl text-slate-400 text-[10px] font-black tracking-wide uppercase">
          High-Demand
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {topFive.map((product, index) => (
          <div
            key={product.id || product.name || index}
            className="
            flex
            items-center
            justify-between
            p-3
            bg-white/45
            backdrop-blur-xs
            border border-white/60
            rounded-2xl
            shadow-3xs
            hover:bg-white/90
            hover:border-indigo-100/70
            hover:shadow-xs
            hover:scale-[1.01]
            group
            transition-all
            duration-300
            "
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`
                w-8
                h-8
                rounded-xl
                flex
                items-center
                justify-center
                text-xs
                font-black
                tracking-tight
                transition-transform
                duration-300
                group-hover:scale-105
                ${getBadgeClass(index)}
                `}
              >
                {index + 1}
              </div>

              <div>
                <p className="text-xs font-black tracking-tight text-slate-500 group-hover:text-slate-900 transition-colors">
                  {product.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Best Seller
                </p>
              </div>
            </div>

            <div className="text-right pr-1">
              <p className="text-sm font-black tracking-tight text-indigo-600 group-hover:text-indigo-700 transition-colors">
                {product.sales}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                units
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProducts;
