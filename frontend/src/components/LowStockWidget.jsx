import { AlertTriangle, CheckCircle2 } from "lucide-react";

const unitMap = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  pcs: "pcs",
};

function LowStockWidget({ ingredients = []}) {
  return (
    <div
      className="
      relative
      overflow-hidden
      bg-gradient-to-r from-orange-100/100 via-slate-50 to-indigo-200/79
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
          <div
            className={`p-2 rounded-xl shadow-3xs border ${
              ingredients.length === 0
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-orange-500/10 border-orange-500/20"
            }`}
          >
            {ingredients.length === 0 ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={16} className="text-orange-600" />
            )}
          </div>

          <div>
            <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
              Inventory Monitoring
            </span>

            <h4 className="text-lg font-black tracking-tight text-slate-800 mt-0.5">
              Low Stock Alerts
            </h4>
          </div>
        </div>

        <div className="flex items-center px-2.5 py-1 bg-white/90 border border-slate-100 shadow-3xs rounded-xl text-slate-400 text-[10px] font-black tracking-wide uppercase">
          Critical
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {ingredients.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-white/45 backdrop-blur-xs border border-white/60 rounded-2xl shadow-3xs">
            <p className="text-xs font-black tracking-tight text-emerald-600 uppercase tracking-wider text-center">
              All ingredients sufficiently stocked
            </p>
          </div>
        ) : (
          ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
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
              hover:border-orange-200/80
              hover:shadow-xs
              hover:scale-[1.01]
              group
              transition-all
              duration-300
              "
            >
              <div>
                <p className="text-xs font-black tracking-tight text-slate-700 group-hover:text-slate-900 transition-colors">
                  {ingredient.name}
                </p>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {unitMap[ingredient.unit]}
                </p>
              </div>

              <div className="text-right flex flex-col items-end bg-orange-50 px-3 py-2 border border-orange-100/60 rounded-xl">
                <span className="text-xs font-black text-orange-600">
                  {ingredient.stock} {unitMap[ingredient.unit]}
                </span>

                <span className="text-[10px] text-slate-500">
                  Min: {ingredient.minimum_stock}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LowStockWidget;