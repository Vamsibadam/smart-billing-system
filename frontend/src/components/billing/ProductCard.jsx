function ProductCard({
  product,
  cart = [], 
  onClick,
  onBadgeClick,
}) {
  const cartItem = cart?.find((item) => item.id === product.id);

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      disabled={!product.available}
      className={`group relative flex w-full flex-col justify-between text-left select-none transition-all duration-300
        /* Mobile styles (< sm) */
        h-[104px] rounded-[22px] p-3.5 border overflow-hidden
        ${
          product.available
            ? "bg-white border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] active:scale-[0.97]"
            : "border-slate-100 bg-slate-50/60 opacity-50 cursor-not-allowed"
        }
        /* Desktop styles (>= sm) — 100% UNTOUCHED */
        sm:h-40 sm:rounded-[28px] sm:p-5
        ${
          product.available
            ? "sm:cursor-pointer sm:border-slate-200/80 sm:hover:-translate-y-1.5 sm:hover:border-orange-400 sm:hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.12)] sm:active:scale-[0.97]"
            : "sm:cursor-not-allowed sm:border-slate-100 sm:bg-slate-50/50 sm:opacity-40"
        }
      `}
    >
      {/* Mobile Subtle Status Spine */}
      {product.available ? (
        <div
          className={`sm:hidden absolute left-0 inset-y-0 w-1 ${
            cartItem
              ? "bg-gradient-to-b from-indigo-500 to-indigo-600"
              : "bg-gradient-to-b from-orange-400 to-amber-500"
          }`}
        />
      ) : (
        <div className="sm:hidden absolute left-0 inset-y-0 w-1 bg-rose-400" />
      )}

      {/* Decorative top-accent glow line for desktop hover */}
      {product.available && (
        <div className="hidden sm:block absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Title Header */}
      <div className="w-full pl-1 sm:pl-0">
        <h3 className="line-clamp-2 text-xs font-black tracking-tight text-slate-800 transition-colors duration-200 group-hover:text-slate-900 sm:text-base xl:text-2xl leading-snug sm:leading-normal">
          {product.name}
        </h3>
      </div>

      {/* Footer Info Container */}
      <div className="flex items-end justify-between w-full pl-1 sm:pl-0">
        {/* Pricing Panel Box */}
        <div>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
            Price
          </p>
          <p className="text-base sm:text-xl font-black tracking-tight text-orange-500 transition-transform duration-200 group-hover:scale-[1.02] xl:text-2xl mt-0.5 leading-none">
            ₹{Number(product.price).toFixed(2)}
          </p>
        </div>

        {/* Dynamic Action Metrics Pill Stack */}
        <div className="flex flex-col items-end gap-1 sm:gap-1.5">
          {cartItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBadgeClick(cartItem);
              }}
              className="inline-flex cursor-pointer items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 px-2.5 py-1 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black text-indigo-600 shadow-sm border border-indigo-200/20 transition-all duration-200 hover:from-indigo-100 hover:to-indigo-200 hover:text-indigo-700 hover:shadow active:scale-95 animate-in fade-in zoom-in-95 duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Qty {cartItem.quantity}</span>
            </button>
          )}

          {!product.available && (
            <span className="inline-block rounded-md sm:rounded-lg bg-red-50 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-500 border border-red-100/50">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ProductCard;