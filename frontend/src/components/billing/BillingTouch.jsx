import CategoryRibbon from "./CategoryRibbon";
import ProductCard from "./ProductCard";

function BillingTouch({
  search,
  setSearch,
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  addToCart,
  cartProps,
  openQuantityDialog,
}) {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Products..."
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-lg font-semibold outline-none focus:border-orange-500"
        />
      </div>

      <CategoryRibbon
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="flex items-start gap-6">
        <div className="flex-1">
         
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
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
      </div>
    </div>
  );
}

export default BillingTouch;
