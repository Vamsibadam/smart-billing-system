import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function IngredientModal({
  ingredient,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({
    name: "",
    unit: "pcs",
    stock: "",
    minimum_stock: "",
    cost_price: "",
    is_active: true,
  });

  useEffect(() => {
    if (ingredient) {
      setForm({
        ...ingredient,
      });
    } else {
      setForm({
        name: "",
        unit: "pcs",
        stock: "",
        minimum_stock: "",
        cost_price: "",
        is_active: true,
      });
    }
  }, [ingredient]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Ingredient name is required.");
      return;
    }

    if (Number(form.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    if (Number(form.minimum_stock) < 0) {
      alert("Minimum stock cannot be negative.");
      return;
    }

    if (Number(form.cost_price) < 0) {
      alert("Cost price cannot be negative.");
      return;
    }

    onSave(form);
  };

  return createPortal(
    <div
  className="
  fixed
  inset-0
  bg-slate-950/40
  backdrop-blur-sm
  flex
  items-center
  justify-center
  z-[100]
  p-4
  pointer-events-auto
  "
>
  {/* Wide Horizontal Rectangle - Anchored in screen center */}
  <div
    className="
    bg-white
    w-full
    max-w-4xl
    rounded-3xl
    shadow-2xl
    border
    border-slate-200
    overflow-hidden
    "
  >
    {/* Header */}
    <div className="px-8 py-6 border-b border-slate-100">
      <h2 className="text-2xl font-black text-slate-800">
        {ingredient ? "Edit Ingredient" : "Add Ingredient"}
      </h2>
      <p className="text-slate-500 mt-1 text-sm">
        Manage kitchen inventory
      </p>
    </div>

    {/* Body: Wide multi-column horizontal grid layout */}
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* Row 1 / Col 1: Name */}
      <div className="md:col-span-2 lg:col-span-1">
        <label className="text-sm font-semibold text-slate-600 mb-2 block">
          Ingredient Name
        </label>
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Milk"
          className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Row 1 / Col 2: Unit */}
      <div>
        <label className="text-sm font-semibold text-slate-600 mb-2 block">
          Unit
        </label>
        <select
          value={form.unit}
          onChange={(e) => handleChange("unit", e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 bg-white"
        >
          <option value="g">Gram (g)</option>
          <option value="kg">Kilogram (kg)</option>
          <option value="ml">Millilitre (ml)</option>
          <option value="l">Litre (L)</option>
          <option value="pcs">Pieces</option>
        </select>
      </div>

      {/* Row 1 / Col 3: Cost Price */}
      <div>
        <label className="text-sm font-semibold text-slate-600 mb-2 block">
          Cost Price
        </label>
        <input
          type="number"
          value={form.cost_price}
          onChange={(e) => handleChange("cost_price", e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Row 2 / Col 1: Opening Stock */}
      <div>
        <label className="text-sm font-semibold text-slate-600 mb-2 block">
          Opening Stock
        </label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => handleChange("stock", e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Row 2 / Col 2: Minimum Stock */}
      <div>
        <label className="text-sm font-semibold text-slate-600 mb-2 block">
          Minimum Stock
        </label>
        <input
          type="number"
          value={form.minimum_stock}
          onChange={(e) => handleChange("minimum_stock", e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Row 2 / Col 3: Status Checkbox */}
      <div className="flex items-end">
        <label
          className="
          flex
          items-center
          gap-3
          bg-slate-50
          rounded-xl
          p-3.5
          w-full
          border
          border-slate-100
          cursor-pointer
          "
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => handleChange("is_active", e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="font-semibold text-slate-700 text-sm">
            Active Ingredient
          </span>
        </label>
      </div>

    </div>

    {/* Footer */}
    <div className="flex justify-end gap-4 p-6 border-t border-slate-100 bg-slate-50/50">
      <button
        onClick={onClose}
        className="
        px-6
        py-3
        border
        border-slate-300
        rounded-xl
        font-bold
        text-slate-600
        hover:bg-slate-100
        transition
        cursor-pointer
        "
      >
        Cancel
      </button>

      <button
        onClick={handleSubmit}
        className="
        px-8
        py-3
        bg-gradient-to-r
        from-orange-500
        to-indigo-600
        rounded-xl
        text-white
        font-bold
        hover:opacity-95
        transition
        cursor-pointer
        "
      >
        {ingredient ? "Update Ingredient" : "Save Ingredient"}
      </button>
    </div>
  </div>
</div>,document.body

  );
}

export default IngredientModal;