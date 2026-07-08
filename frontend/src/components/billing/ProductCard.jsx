function ProductCard({
  product,
  cart = [], // Defensive default to prevent errors if cart array is uninitialized
  onClick,
  onBadgeClick,
}) {
  // Safe item matching configuration
  const cartItem = cart?.find((item) => item.id === product.id);

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      disabled={!product.available}
      className={`group relative flex h-40 flex-col justify-between rounded-[28px] border bg-white p-5 text-left select-none transition-all duration-300 ${
        product.available
          ? "cursor-pointer border-slate-200/80 hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.12)] active:scale-[0.97]"
          : "cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-40"
      }`}
    >
      {/* Decorative top-accent glow line shown only when item is hovered */}
      {product.available && (
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Product Content Title Header */}
      <div className="w-full">
        <h3 className="line-clamp-2 text-base font-black tracking-tight text-slate-800 transition-colors duration-200 group-hover:text-slate-900 xl:text-lg">
          {product.name}
        </h3>
      </div>

      {/* Footer Info Container */}
      <div className="flex items-end justify-between w-full">
        {/* Pricing Panel Box */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Price
          </p>
          <p className="text-xl font-black tracking-tight text-orange-500 transition-transform duration-200 group-hover:scale-[1.02] xl:text-2xl">
            ₹{Number(product.price).toFixed(2)}
          </p>
        </div>

        {/* Dynamic Action Metrics Pill Stack */}
        <div className="flex flex-col items-end gap-1.5">
          {cartItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Stops the base card trigger from running twice
                onBadgeClick(cartItem);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 px-4 py-2 text-xs font-black text-indigo-600 shadow-sm border border-indigo-200/20 transition-all duration-200 hover:from-indigo-100 hover:to-indigo-200 hover:text-indigo-700 hover:shadow active:scale-95 animate-in fade-in zoom-in-95 duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Qty {cartItem.quantity}
            </button>
          )}

          {!product.available && (
            <span className="inline-block rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-500 border border-red-100/50">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ProductCard;
