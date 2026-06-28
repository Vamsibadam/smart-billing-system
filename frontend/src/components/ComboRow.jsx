import { useMemo, useState } from "react";

function ComboRow({
  item,
  products,
  selectedProducts,
  onChange,
  onDelete,
}) {
  const [search, setSearch] = useState(
    item.product_name || ""
  );

  const [showResults, setShowResults] =
    useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        (product.id === item.product ||
          !selectedProducts.includes(product.id)) &&
        product.name
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [
    search,
    products,
    selectedProducts,
    item.product,
  ]);

  const selectProduct = (product) => {
    onChange(item.id, "product", product.id);
    onChange(
      item.id,
      "product_name",
      product.name
    );

    setSearch(product.name);
    setShowResults(false);
  };

  return (
    <div className="border border-slate-100 bg-white rounded-xl p-3.5 shadow-3xs mb-3 last:mb-0 transition-all hover:border-slate-200">
  <div className="grid grid-cols-12 gap-3.5 items-end">

    {/* Product Keyword Search Autocomplete Column */}
    <div className="col-span-7 relative">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
        Product
      </label>
      
      <input
        type="text"
        value={search}
        placeholder="Search product..."
        onFocus={() => setShowResults(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowResults(true);
        }}
        className="w-full bg-slate-50/60 border border-slate-200/80 rounded-lg p-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
      />

      {/* FIXED: Removed search.trim() requirement so items populate instantly on field focus */}
      {showResults && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-100">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => selectProduct(product)}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
              >
                {product.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>

    {/* Compact Quantity Column */}
    <div className="col-span-2">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
        Qty
      </label>
      <input
        type="number"
        min={1}
        value={item.quantity}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(item.id, "quantity", Number(e.target.value))}
        className="w-full bg-slate-50/60 border border-slate-200/80 rounded-lg p-2.5 text-center text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
      />
    </div>

    {/* Compact Actions Column */}
    <div className="col-span-3">
      <button
        onClick={() => onDelete(item.id)}
        className="w-full bg-red-50 text-red-600 border border-red-100/50 rounded-lg p-2.5 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
      >
        Remove
      </button>
    </div>

  </div>
</div>

  );
}

export default ComboRow;