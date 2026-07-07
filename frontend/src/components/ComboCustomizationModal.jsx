import { useState } from "react";
import { createPortal } from "react-dom";

function ComboCustomizationModal({
  product,
  comboItems,
  onContinue,
  onClose,
}) {
  const [selectedProducts, setSelectedProducts] = useState(
    comboItems.map((item) => ({
      combo_item_id: item.combo_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      alternatives: item.alternatives || [],
      recipe: item.recipe || [],
    }))
  );

  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");

  const getSearchResults = (item) => {
    const products = [
      {
        id: item.product_id,
        name: item.product_name,
      },
      ...(item.alternatives || []),
    ];

    const unique = products.filter(
      (p, index, self) =>
        index === self.findIndex((x) => x.id === p.id)
    );

    return unique.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-black">
            {product.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Customize Combo Products
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedProducts.map((item, index) => (
            <div
              key={item.combo_item_id}
              className="border rounded-2xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs uppercase text-slate-400 font-bold">
                    Combo Item
                  </div>

                  <div className="font-black text-lg mt-1">
                    {item.product_name}
                  </div>
                </div>

                <div className="relative">
                  {(item.alternatives || []).length === 0 ? (
                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-400">
                      No Alternatives
                    </span>
                  ) : editingIndex === index ? (
                    <>
                      <input
                        autoFocus
                        value={search}
                        placeholder="Search product..."
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        className="w-64 border border-indigo-300 rounded-xl p-3 outline-none focus:border-indigo-500"
                      />

                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border shadow-xl max-h-56 overflow-y-auto z-50">
                        {getSearchResults(item).length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-400">
                            No products found
                          </div>
                        ) : (
                          getSearchResults(item).map((alt) => (
                            <button
                              key={alt.id}
                              type="button"
                              onClick={() => {
                                const updated = [...selectedProducts];

                                updated[index] = {
                                  ...updated[index],
                                  product_id: alt.id,
                                  product_name: alt.name,
                                };

                                setSelectedProducts(updated);
                                setEditingIndex(null);
                                setSearch("");
                              }}
                              className={`w-full text-left px-4 py-3 transition hover:bg-indigo-50 ${
                                alt.id === item.product_id
                                  ? "bg-indigo-100 font-bold text-indigo-700"
                                  : ""
                              }`}
                            >
                              {alt.name}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingIndex(index);
                        setSearch("");
                      }}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border rounded-xl px-5 py-3 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={() => onContinue(selectedProducts)}
            className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white rounded-xl px-6 py-3 font-bold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ComboCustomizationModal;