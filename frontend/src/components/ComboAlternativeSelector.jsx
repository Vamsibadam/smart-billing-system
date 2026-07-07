import { useMemo, useState } from "react";

function ComboAlternativeSelector({
  comboItem,
  products,
  selected,
  onChange,
}) {
  const [search, setSearch] = useState("");

  const availableProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.id !== comboItem.product &&
        product.product_type === "PRODUCT" &&
        product.name
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [products, comboItem.product, search]);

  const handleSelect = (product) => {
    if (selected.includes(product.id)) {
      return;
    }

    onChange([
      ...selected,
      product.id,
    ]);

    setSearch("");
  };

  const removeAlternative = (id) => {
    onChange(
      selected.filter(
        (item) => item !== id
      )
    );
  };

  return (
    <div className="mt-4">

      <p className="text-xs font-bold uppercase text-slate-500 mb-2">
        Allowed Alternatives
      </p>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search Product..."
        className="
        w-full
        border
        rounded-xl
        p-3
        mb-3
        outline-none
        focus:border-indigo-500
        "
      />

      {search !== "" && (

        <div className="
        border
        rounded-xl
        max-h-48
        overflow-y-auto
        ">

          {availableProducts.map((product) => (

            <button
              key={product.id}
              type="button"
              onClick={() =>
                handleSelect(product)
              }
              className="
              w-full
              text-left
              px-4
              py-3
              hover:bg-slate-50
              border-b
              last:border-none
              cursor-pointer
              "
            >
              {product.name}
            </button>

          ))}

        </div>

      )}

      <div className="
      flex
      flex-wrap
      gap-2
      mt-3
      ">

        {selected.map((id) => {

          const product =
            products.find(
              (p) => p.id === id
            );

          if (!product) return null;

          return (

            <div
              key={id}
              className="
              flex
              items-center
              gap-2
              bg-indigo-100
              text-indigo-700
              px-3
              py-1
              rounded-full
              text-sm
              "
            >

              {product.name}

              <button
                type="button"
                onClick={() =>
                  removeAlternative(id)
                }
                className="font-bold"
              >
                ✕
              </button>

            </div>

          );

        })}

      </div>

    </div>
  );
}

export default ComboAlternativeSelector;