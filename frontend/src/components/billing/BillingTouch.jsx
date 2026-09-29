import React from "react";
import CategoryRibbon from "./CategoryRibbon";
import ProductCard from "./ProductCard";
import { Search, Plus, X } from "lucide-react";

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
    <div className="w-full space-y-3 sm:space-y-6 pb-36 lg:pb-8">
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
          - Mobile: Streamlined touch chips
          - Desktop: Untouched CategoryRibbon
      ========================================================== */}
      <div className="hidden md:block">
        <CategoryRibbon
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
            selectedCategory === null
              ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-sm shadow-orange-500/20"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
          }`}
        >
          All
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-sm shadow-orange-500/20"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          3. PRODUCT CARDS
          - Mobile: 3 COLUMNS GRID
          - Desktop: Untouched ProductCard Grid
      ========================================================== */}
      {/* Desktop View */}
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

      {/* Mobile View: 3 Columns Grid */}
      <div className="md:hidden grid grid-cols-3 gap-2">
        {filteredProducts.map((product) => {
          const qtyInCart = cartItemMap[product.id] || 0;
          const isOutOfStock = !product.available;

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
                flex
                flex-col
                justify-between
                min-h-[105px]
                p-2.5
                rounded-2xl
                border
                transition-all
                duration-150
                active:scale-[0.96]
                cursor-pointer
                ${
                  isOutOfStock
                    ? "bg-slate-100/60 border-slate-200/60 opacity-60 pointer-events-none"
                    : qtyInCart > 0
                    ? "bg-white border-orange-500 shadow-md ring-2 ring-orange-500/20"
                    : "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                }
              `}
            >
              {/* Floating Quantity Pill Badge */}
              {qtyInCart > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const itemInCart = cart.find((i) => i.id === product.id);
                    if (itemInCart && openQuantityDialog) {
                      openQuantityDialog(itemInCart);
                    }
                  }}
                  className="
                    absolute
                    -top-2
                    -right-1.5
                    w-5
                    h-5
                    rounded-full
                    bg-gradient-to-r
                    from-orange-500
                    to-indigo-600
                    text-white
                    font-black
                    text-[10px]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    border-2
                    border-white
                  "
                >
                  {qtyInCart}
                </div>
              )}

              {/* Title & Tag */}
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block truncate leading-none">
                  {product.category_name || "Item"}
                </span>
                <h3 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight mt-1">
                  {product.name}
                </h3>
              </div>

              {/* Bottom Price & Add Action */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[7.5px] font-extrabold uppercase text-slate-400 block leading-none">
                    Price
                  </span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block leading-none">
                    ₹{product.price}
                  </span>
                </div>

                {isOutOfStock ? (
                  <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-1 py-0.5 rounded">
                    Out
                  </span>
                ) : (
                  <div
                    className={`
                      w-6
                      h-6
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      transition-colors
                      ${
                        qtyInCart > 0
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700"
                      }
                    `}
                  >
                    <Plus size={13} strokeWidth={2.5} />
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