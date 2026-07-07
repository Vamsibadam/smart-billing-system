import { useMemo, useState } from "react";
import ComboAlternativeSelector from "./ComboAlternativeSelector";

function ComboRow({
  item,
  products,
  selectedProducts,
  onChange,
  onDelete,
  onAlternativeChange,
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
  const [allowAlternatives, setAllowAlternatives] =
  useState(
    (item.alternative_ids || []).length > 0
  );

 return (
<div className="border border-slate-100 bg-white rounded-xl p-3.5 shadow-3xs mb-3 last:mb-0 transition-all hover:border-slate-200">

  <div className="grid grid-cols-12 gap-3.5 items-end">

    {/* Product */}
    <div className="col-span-6 relative">

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

      {showResults && (

        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">

          {filteredProducts.map((product)=>(

            <button
              key={product.id}
              type="button"
              onClick={() => selectProduct(product)}
              className="w-full text-left px-4 py-2 hover:bg-indigo-50 cursor-pointer"
            >
              {product.name}
            </button>

          ))}

        </div>

      )}

    </div>

    {/* Qty */}
    <div className="col-span-2">

      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
        Qty
      </label>

      <input
        type="number"
        min={1}
        value={item.quantity}
        onFocus={(e)=>e.target.select()}
        onChange={(e)=>
          onChange(
            item.id,
            "quantity",
            Number(e.target.value)
          )
        }
        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center text-xs font-bold"
      />

    </div>

    {/* Toggle */}
    <div className="col-span-2">

      <label className="flex items-center gap-2 mt-6">

        <input
          type="checkbox"
          checked={allowAlternatives}
          onChange={(e)=>{

            setAllowAlternatives(
              e.target.checked
            );

            if(!e.target.checked){

              onAlternativeChange(
                item.id,
                []
              );

            }

          }}
        />

        <span className="text-xs font-bold">
          Alternatives
        </span>

      </label>

    </div>

    {/* Remove */}
    <div className="col-span-2">

      <button
        onClick={() => onDelete(item.id)}
        className="w-full bg-red-50 text-red-600 border border-red-100 rounded-lg p-2.5 text-xs font-bold hover:bg-red-100"
      >
        Remove
      </button>

    </div>

  </div>

  {allowAlternatives && (

    <div className="mt-4 pt-4 border-t">

      <ComboAlternativeSelector

        comboItem={item}

        products={products}

        selected={
          item.alternative_ids || []
        }

        onChange={(ids)=>
          onAlternativeChange(
            item.id,
            ids
          )
        }

      />

    </div>

  )}

</div>
);
}

export default ComboRow;