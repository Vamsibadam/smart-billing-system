import React from "react";
import CategoryRibbon from "./CategoryRibbon";
import ProductCard from "./ProductCard";
import { Search, Plus, X, ShoppingBag } from "lucide-react";

function BillingTouch({
  search,
  setSearch,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  filteredProducts = [],
  addToCart,
  cartProps,
  openQuantityDialog,
}) {
  const { cart = [] } = cartProps || {};

  // Quick lookup of in-cart quantities for badge count
  const cartItemMap = React.useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      map[item.id] = (map[item.id] || 0) + (item.quantity || 1);
    });
    return map;
  }, [cart]);

  return (
    <div className="w-full space-y-3.5 sm:space-y-6 pb-36 lg:pb-8">
      {/* =========================================================
          1. SEARCH BAR
      ========================================================== */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search size={16} className="sm:w-5 sm:h-5" />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Products..."
          className="
            w-full
            rounded-2xl
            border border-slate-200/90
            bg-white
            py-2.5 sm:py-4
            pl-9 sm:pl-11
            pr-8 sm:pr-4
            text-xs sm:text-lg
            font-bold
            text-slate-800
            placeholder:text-slate-400
            outline-none
            focus:border-orange-500
            shadow-xs
            transition-all
          "
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* =========================================================
          2. CATEGORIES
          - Mobile: Enlarged, tactile ribbon
          - Desktop: Untouched CategoryRibbon
      ========================================================== */}
      <div className="hidden md:block">
        <CategoryRibbon
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
            selectedCategory === null
              ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-md shadow-orange-500/20"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span>All Items</span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
                isSelected
                  ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          3. PRODUCT CARDS
          - Mobile: 2-Column Responsive High-Utility Cards
          - Desktop: Untouched ProductCard Grid
      ========================================================== */}
      {/* Desktop View (100% UNTOUCHED) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cartProps?.cart}
              onClick={addToCart}
              onBadgeClick={openQuantityDialog}
            />
          ))}
        </div>
      </div>

      {/* Mobile View: High-Utility Tactile Cards */}
      <div className="md:hidden grid grid-cols-2 gap-2.5">
        {filteredProducts.map((product) => {
          const qtyInCart = cartItemMap[product.id] || 0;
          const isOutOfStock = !product.available;
          const isCombo = product.product_type === "COMBO";

          return (
            <div
              key={product.id}
              onClick={() => {
                if (isOutOfStock) return;
                addToCart(product);
              }}
              className={`
                group
                relative
                overflow-hidden
                flex
                flex-col
                justify-between
                min-h-[128px]
                p-3.5
                rounded-[22px]
                border
                transition-all
                duration-150
                active:scale-[0.97]
                select-none
                ${
                  isOutOfStock
                    ? "bg-slate-50/70 border-slate-200/70 opacity-50 pointer-events-none cursor-not-allowed"
                    : qtyInCart > 0
                    ? "bg-white border-orange-400 shadow-md ring-2 ring-orange-500/20 cursor-pointer"
                    : "bg-white border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] hover:border-slate-300 cursor-pointer"
                }
              `}
            >
              {/* Left Accent Spine */}
              <div
                className={`absolute left-0 inset-y-0 w-1 ${
                  isOutOfStock
                    ? "bg-rose-400"
                    : isCombo
                    ? "bg-gradient-to-b from-orange-400 to-amber-500"
                    : qtyInCart > 0
                    ? "bg-gradient-to-b from-indigo-500 to-indigo-600"
                    : "bg-gradient-to-b from-orange-400 to-indigo-500"
                }`}
              />

              {/* Card Header: Category Chip + Live Qty Badge */}
              <div className="flex items-center justify-between gap-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 max-w-[90px] truncate leading-none">
                  {product.category_name || (isCombo ? "Combo" : "Item")}
                </span>

                {qtyInCart > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const itemInCart = cart.find((i) => i.id === product.id);
                      if (itemInCart && openQuantityDialog) {
                        openQuantityDialog(itemInCart);
                      }
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      px-2
                      py-0.5
                      rounded-lg
                      bg-gradient-to-r
                      from-orange-500
                      to-indigo-600
                      text-white
                      text-[10px]
                      font-black
                      shadow-xs
                      active:scale-90
                      transition-transform
                    "
                  >
                    <span>Qty {qtyInCart}</span>
                  </button>
                )}
              </div>

              {/* Product Title */}
              <div className="my-2 pl-1">
                <h3 className="text-xs font-black text-slate-800 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
              </div>

              {/* Bottom: Price + Quick Action Pill */}
              <div className="pt-2 border-t border-slate-100/90 flex items-center justify-between pl-1">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                    Price
                  </span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block leading-none">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                </div>

                {isOutOfStock ? (
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    Out
                  </span>
                ) : (
                  <div
                    className={`
                      w-7
                      h-7
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      transition-all
                      ${
                        qtyInCart > 0
                          ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }
                    `}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-14 text-center text-xs font-bold text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
          No products found matching selection.
        </div>
      )}
    </div>
  );
}

export default BillingTouch;