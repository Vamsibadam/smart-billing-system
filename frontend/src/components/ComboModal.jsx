import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { getCombo, saveCombo } from "../services/comboService";
import ComboRow from "./ComboRow";
import { createPortal } from "react-dom";

function ComboModal({
  product,
  onClose,
}) {
  const [combo, setCombo] = useState([]);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product) {
      loadData();
    }
  }, [product]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [comboData, productsData] = await Promise.all([
        getCombo(product.id),
        getProducts(),
      ]);

      setCombo(comboData);

      setProducts(
        productsData.filter(
          (p) =>
            p.product_type === "PRODUCT" &&
            p.id !== product.id &&
            p.status === "active"
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCombo = (id, field, value) => {
    setCombo((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    setCombo((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const addItem = () => {
    setCombo((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: "",
        product_name: "",
        quantity: 1,
      },
    ]);
  };

  const handleSave = async () => {
    if (combo.length === 0) {
      alert("Combo cannot be empty.");
      return;
    }

    for (const item of combo) {
      if (!item.product) {
        alert("Select all products.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        alert("Quantity must be greater than zero.");
        return;
      }
    }

    const productIds = combo.map((item) =>
      Number(item.product)
    );

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      alert(
        "Duplicate products are not allowed."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = combo.map((item) => ({
        product: Number(item.product),
        quantity: Number(item.quantity),
      }));

      await saveCombo(product.id, payload);

      await loadData();

      alert("Combo saved successfully.");

      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to save combo.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
   <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
  {/* Wide, high-utility horizontal rectangle box */}
  <div className="bg-white rounded-[28px] w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
    
    {/* Header Section */}
    <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-white">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">
          {product.name}
        </h2>
        <p className="text-sm font-semibold text-indigo-600/80 mt-0.5 uppercase tracking-wider">
          Combo Builder
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-9 h-9 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all cursor-pointer text-lg font-bold"
      >
        ✕
      </button>
    </div>

    {/* Scrollable Container Zone: Keeps content accessible without expanding the whole modal */}
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30 space-y-4">
      {loading ? (
        <div className="text-center py-12 font-semibold text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="inline-block animate-pulse">Loading items...</span>
        </div>
      ) : (
        <>
          {combo.length === 0 && (
            <div className="text-center py-12 font-bold text-slate-400 bg-white/60 border border-dashed border-slate-200 rounded-2xl uppercase tracking-wider text-xs">
              No products added yet.
            </div>
          )}

          {combo.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs transition-all hover:border-slate-200"
            >
              <ComboRow
                item={item}
                products={products}
                selectedProducts={combo.map((i) => Number(i.product))}
                onChange={updateCombo}
                onDelete={deleteItem}
              />
            </div>
          ))}
        </>
      )}

      {/* Inline Add Action Button */}
      <div className="pt-2">
        <button
          onClick={addItem}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-all cursor-pointer shadow-3xs"
        >
          + Add Product Items
        </button>
      </div>
    </div>

    {/* Persistent Footer Control Bar */}
    <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
      <button
        onClick={onClose}
        className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer bg-white"
      >
        Cancel
      </button>

      <button
        disabled={saving}
        onClick={handleSave}
        className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-bold text-sm shadow-sm hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving ? "Saving Changes..." : "Save Combo Arrangement"}
      </button>
    </div>

  </div>
</div>,  document.body  

  );
}

export default ComboModal;