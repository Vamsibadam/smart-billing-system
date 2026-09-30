import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import IngredientModal from "../components/IngredientModal";

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  adjustIngredientStock,
} from "../services/ingredientService";
import StockAdjustmentModal from "../components/StockAdjustmentModal";
import { createPortal } from "react-dom";
import { Search, Plus, Sparkles, AlertCircle, X, Layers } from "lucide-react";

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockIngredient, setSelectedStockIngredient] = useState(null);

  const unitMap = {
    g: "Gram",
    kg: "Kilogram",
    ml: "Millilitre",
    l: "Litre",
    pcs: "Pieces",
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (ingredient) => {
    try {
      if (selectedIngredient) {
        await updateIngredient(selectedIngredient.id, ingredient);
      } else {
        await createIngredient(ingredient);
      }

      fetchIngredients();
      setShowModal(false);
      setSelectedIngredient(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;

    try {
      await deleteIngredient(id);
      fetchIngredients();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockAdjustment = async (data) => {
    try {
      await adjustIngredientStock(selectedStockIngredient.id, data);
      fetchIngredients();
      setShowStockModal(false);
      setSelectedStockIngredient(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="w-full pb-36 lg:pb-12">
        {/* =========================================================
            HEADER & TOP ACTIONS
        ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6 mt-2 sm:mt-5 relative z-10 px-3.5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                Ingredients
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
                <Sparkles size={10} /> {filteredIngredients.length} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              Manage kitchen raw materials and inventory stock balances
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedIngredient(null);
              setShowModal(true);
            }}
            className="
              w-full sm:w-auto
              bg-gradient-to-r from-orange-500 to-indigo-600
              text-white
              px-5 sm:px-6
              py-2.5 sm:py-3.5
              rounded-xl sm:rounded-2xl
              text-xs sm:text-sm
              font-black
              tracking-wide
              shadow-sm
              hover:opacity-95
              active:scale-95
              transition-all
              duration-200
              cursor-pointer
              text-center
              flex items-center justify-center gap-1.5
            "
          >
            <Plus size={16} />
            <span>Add Ingredient</span>
          </button>
        </div>

        {/* =========================================================
            SEARCH & INVENTORY LEDGER
        ========================================================== */}
        <div
          className="
            bg-white/80
            backdrop-blur-md
            border border-slate-200/80
            rounded-2xl sm:rounded-[28px]
            mx-3 sm:mx-6
            px-3.5 sm:px-6
            py-4 sm:py-6
            shadow-xs
            relative 
            z-10
          "
        >
          {/* Search Box */}
          <div className="mb-4 sm:mb-6 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search Ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                bg-slate-50/70
                border border-slate-200/80
                text-slate-800
                rounded-xl sm:rounded-2xl
                py-2.5 sm:py-3.5
                pl-10 sm:pl-11
                pr-8 sm:pr-4
                text-xs sm:text-base
                font-medium
                placeholder:text-slate-400
                outline-none
                focus:bg-white
                focus:border-indigo-400
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
              MOBILE INGREDIENT CARDS (Screen < md)
          ========================================================== */}
          <div className="block md:hidden space-y-3">
            {filteredIngredients.map((ingredient) => {
              const isLowStock =
                Number(ingredient.stock) <= Number(ingredient.minimum_stock);

              return (
                <div
                  key={ingredient.id}
                  className={`
                    relative
                    overflow-hidden
                    rounded-[24px]
                    bg-white
                    p-4
                    border
                    shadow-[0_8px_22px_-6px_rgba(15,23,42,0.06)]
                    transition-all
                    active:scale-[0.985]
                    space-y-3.5
                    ${
                      isLowStock
                        ? "border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/25"
                        : "border-slate-200/70 hover:border-slate-300"
                    }
                  `}
                >
                  {/* Left Ambient Status Spine */}
                  <div
                    className={`absolute left-0 inset-y-0 w-1.5 ${
                      isLowStock
                        ? "bg-gradient-to-b from-rose-500 to-amber-500"
                        : ingredient.is_active
                        ? "bg-gradient-to-b from-emerald-500 to-cyan-400"
                        : "bg-slate-300"
                    }`}
                  />

                  {/* Top Bar: Badges + Unit Cost Badge */}
                  <div className="flex items-center justify-between gap-2 pl-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-indigo-50/80 text-indigo-700 border border-indigo-100/60">
                        {unitMap[ingredient.unit] || ingredient.unit}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                          ingredient.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-slate-100 text-slate-500 border-slate-200/80"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ingredient.is_active
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-400"
                          }`}
                        />
                        {ingredient.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Cost Badge */}
                    <div className="shrink-0 px-3 py-1 rounded-xl bg-slate-900 text-white shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 mr-1">
                        Cost
                      </span>
                      <span className="text-xs font-black tracking-tight">
                        ₹{ingredient.cost_price}
                      </span>
                    </div>
                  </div>

                  {/* Title & Stock Information */}
                  <div className="pl-1.5 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug truncate">
                        {ingredient.name}
                      </h3>
                      <span className="font-mono text-[10px] font-semibold text-slate-400 shrink-0">
                        #{ingredient.id}
                      </span>
                    </div>

                    {/* Stock Meter Capsule */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block leading-none">
                          Current Stock
                        </span>
                        <span
                          className={`text-sm font-black mt-0.5 block ${
                            isLowStock ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {ingredient.stock} {unitMap[ingredient.unit] || ingredient.unit}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block leading-none">
                          Min Threshold
                        </span>
                        <span className="text-xs font-black text-slate-700 mt-0.5 block">
                          {ingredient.minimum_stock} {unitMap[ingredient.unit] || ingredient.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Warning Strip */}
                  {isLowStock && (
                    <div className="ml-1.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold">
                      <span className="flex items-center gap-1">
                        <AlertCircle size={12} /> Low Stock Alert
                      </span>
                      <span className="text-rose-500 font-medium">Reorder required</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 pl-1.5 border-t border-slate-100/80">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setShowModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStockIngredient(ingredient);
                        setShowStockModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition cursor-pointer"
                    >
                      Stock
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ingredient.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-100 text-rose-600 hover:bg-rose-50 active:scale-95 transition shrink-0 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredIngredients.length === 0 && (
              <div className="py-14 text-center text-xs font-semibold text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                No ingredients found matching your search.
              </div>
            )}
          </div>

          {/* =========================================================
              DESKTOP DATA TABLE (Screen >= md) — 100% UNTOUCHED
          ========================================================== */}
          <div className="hidden md:block overflow-x-auto max-w-full">
            <table className="w-full text-base border-separate border-spacing-y-2">
              <thead className="text-slate-400 font-bold text-xs tracking-wider uppercase">
                <tr>
                  <th className="pb-2 text-left pl-4 w-20">ID</th>
                  <th className="pb-2 text-left">Name</th>
                  <th className="pb-2 text-left w-24">Unit</th>
                  <th className="pb-2 text-left w-36">Stock</th>
                  <th className="pb-2 text-left w-28">Minimum</th>
                  <th className="pb-2 text-left w-28">Cost</th>
                  <th className="pb-2 text-left w-28">Status</th>
                  <th className="pb-2 text-left pl-4 w-44">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredIngredients.map((ingredient) => (
                  <tr
                    key={ingredient.id}
                    className="group hover:bg-slate-50/60 transition-all duration-150"
                  >
                    <td className="py-4 px-4 font-mono text-xs font-bold text-slate-400 rounded-l-xl">
                      {ingredient.id}
                    </td>

                    <td className="py-4 px-2 font-bold text-slate-700 text-base">
                      {ingredient.name}
                    </td>

                    <td className="py-4 px-2 font-semibold text-slate-400 capitalize text-base">
                      {unitMap[ingredient.unit]}
                    </td>

                    <td className="py-4 px-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          Number(ingredient.stock) <=
                          Number(ingredient.minimum_stock)
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {ingredient.stock} {unitMap[ingredient.unit]}
                      </span>
                    </td>

                    <td className="py-4 px-2 font-semibold text-slate-500 text-base">
                      {ingredient.minimum_stock}
                    </td>

                    <td className="py-4 px-2 font-black text-slate-800 text-base">
                      ₹{ingredient.cost_price}
                    </td>

                    <td className="py-4 px-2">
                      {ingredient.is_active ? (
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-white text-emerald-600 border-emerald-200/60">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-white text-red-500 border-red-200/60">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 rounded-r-xl font-bold text-base text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedIngredient(ingredient);
                            setShowModal(true);
                          }}
                          className="
                            text-indigo-600 
                            px-4 
                            py-2.5 
                            rounded-xl 
                            hover:bg-indigo-50 
                            transition-all 
                            cursor-pointer
                            text-base
                          "
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStockIngredient(ingredient);
                            setShowStockModal(true);
                          }}
                          className="
                            text-indigo-600 
                            px-4 
                            py-2.5 
                            rounded-xl 
                            hover:bg-indigo-50 
                            transition-all 
                            cursor-pointer
                            text-base
                          "
                        >
                          Stock
                        </button>

                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="
                            text-red-500 
                            px-4 
                            py-2.5 
                            rounded-xl 
                            hover:bg-red-50 
                            transition-all
                            cursor-pointer
                            text-base
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ingredient Modal Dialog */}
      {showModal &&
        createPortal(
          <IngredientModal
            ingredient={selectedIngredient}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setSelectedIngredient(null);
            }}
          />,
          document.body
        )}

      {/* Stock Adjustment Modal Dialog */}
      {showStockModal &&
        createPortal(
          <StockAdjustmentModal
            ingredient={selectedStockIngredient}
            onSave={handleStockAdjustment}
            onClose={() => {
              setShowStockModal(false);
              setSelectedStockIngredient(null);
            }}
          />,
          document.body
        )}
    </MainLayout>
  );
}

export default Ingredients;