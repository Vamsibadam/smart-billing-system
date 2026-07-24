function DashboardCards({
  icon,
  title,
  value,
  onClick,
  hint,
  className = "",
}) {
  return (
    <div
      onClick={onClick}
      className={`
      relative
      overflow-hidden
      bg-gradient-to-tr
      from-slate-50
      via-white
      to-indigo-50/30
      backdrop-blur-md
      rounded-3xl
      p-6
      border
      border-white/90
      shadow-[0_4px_20px_-4px_rgba(99,102,241,0.03),0_16px_40px_-15px_rgba(0,0,0,0.04)]
      hover:shadow-[0_12px_40px_-6px_rgba(99,102,241,0.08)]
      hover:border-slate-200/80
      transition-all
      duration-500
      group
      ${onClick ? "cursor-pointer hover:-translate-y-1 active:scale-[0.98]" : ""}
      ${className}
      `}
    >
      <div className="absolute bottom-[-20px] left-[-20px] w-36 h-36 bg-gradient-to-tr from-amber-300/5 via-orange-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/5 via-purple-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">

        <div className="space-y-1">

          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block">
            {title}
          </span>
          

          <h2 className="text-2xl font-black tracking-tight text-slate-800 group-hover:text-indigo-950 transition-colors">
            {value}
            
          </h2>
          
        
        </div>

        <div
          className="
          p-3.5
          rounded-2xl
          bg-white
          border
          border-slate-100
          text-indigo-500
          shadow-3xs
          group-hover:scale-105
          group-hover:border-indigo-100
          group-hover:text-indigo-600
          group-hover:shadow-xs
          transition-all
          duration-300
          "
        >
          {icon}
        </div>
        

      </div>
      

      
    </div>
    
  );
}

export default DashboardCards;