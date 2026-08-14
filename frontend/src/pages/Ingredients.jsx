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

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showStockModal, setShowStockModal] =
  useState(false);

const [selectedStockIngredient, setSelectedStockIngredient] =
  useState(null);
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
      setIngredients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (ingredient) => {
    try {
      if (selectedIngredient) {
        await updateIngredient(
          selectedIngredient.id,
          ingredient
        );
      } else {
        await createIngredient(
          ingredient
        );
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

  const filteredIngredients =
    ingredients.filter((ingredient) =>
      ingredient.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    const handleStockAdjustment = async (
  data
) => {

  try {

    await adjustIngredientStock(

      selectedStockIngredient.id,

      data

    );

    fetchIngredients();

    setShowStockModal(false);

    setSelectedStockIngredient(null);

  }

  catch(err){

    console.error(err);

  }

};

  return (
<MainLayout>

  <div className="mb-6 relative z-10 px-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          Ingredients
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          Manage kitchen ingredients
        </p>
      </div>

      <button
        onClick={() => {
          setSelectedIngredient(null);
          setShowModal(true);
        }}
        className="
        bg-gradient-to-r from-orange-500 to-indigo-600
        text-white
        px-6
        py-3.5
        rounded-xl
        text-base
        font-bold
        tracking-wide
        shadow-sm
        hover:opacity-95
        transition-all
        duration-200
        cursor-pointer
        self-start
        sm:self-center
        "
      >
        + Add Ingredient
      </button>
    </div>
  </div>

  <div
    className="
    bg-white
    border border-slate-200/80
    rounded-[28px]
    p-6
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]
    relative
    z-10
    mx-6
    mb-6
    "
  >
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
      </div>
      <input
        placeholder="Search Ingredient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
        w-full
        bg-slate-50/60
        border border-slate-200
        text-slate-800
        rounded-xl
        p-4.5
        pl-10
        text-base
        font-medium
        placeholder:text-slate-400
        outline-none
        focus:bg-white
        focus:border-indigo-400
        transition-all
        "
      />
    </div>

    <div className="overflow-x-auto max-w-full">
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
                    Number(ingredient.stock) <= Number(ingredient.minimum_stock)
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

{showModal && (
  <IngredientModal
    ingredient={selectedIngredient}
    onSave={handleSave}
    onClose={() => {
      setShowModal(false);
      setSelectedIngredient(null);
    }}
  />
)}
{showStockModal && createPortal(
  
  <StockAdjustmentModal
    ingredient={selectedStockIngredient}
    onSave={handleStockAdjustment}
    onClose={() => {
      setShowStockModal(false);
      setSelectedStockIngredient(null);
    }}
  />,document.body
)}


</MainLayout>


  );
}

export default Ingredients;