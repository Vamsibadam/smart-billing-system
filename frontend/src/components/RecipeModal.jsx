import { useEffect, useState } from "react";
import { getRecipe, saveRecipe } from "../services/recipeService";
import { getIngredients } from "../services/ingredientService";
import RecipeRow from "./RecipeRow";
import Notification from "./Notification";
import { createPortal } from "react-dom";

function RecipeModal({ product, onClose, onSaved }) {
  const [recipe, setRecipe] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (product) {
      loadData();
    }
  }, [product]);

  useEffect(() => {
    if (!notification.show) return;

    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.show]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipeData, ingredientData] = await Promise.all([
        getRecipe(product.id),
        getIngredients(),
      ]);

      setRecipe(
        recipeData.map((item) => ({
          ...item,
          alternative_ids: item.alternatives.map((alt) => alt.ingredient),
        }))
      );
      setIngredients(ingredientData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = (id, field, value) => {
    setRecipe((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "quantity" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const deleteIngredient = (id) => {
    setRecipe((prev) => prev.filter((item) => item.id !== id));
  };

  const addIngredient = () => {
    setRecipe((prev) => [
      ...prev,
      {
        id: Date.now(),
        ingredient: "",
        ingredient_name: "",
        quantity: 1,
        unit: "",
        allow_substitution: false,
      },
    ]);
  };

  const handleSave = async () => {
    if (recipe.length === 0) {
      setNotification({
        show: true,
        type: "warning",
        message: "Recipe cannot be empty.",
      });
      return;
    }

    for (const item of recipe) {
      if (!item.ingredient) {
        setNotification({
          show: true,
          type: "warning",
          message: "Select all ingredients.",
        });
        return;
      }

      if (Number(item.quantity) <= 0) {
        setNotification({
          show: true,
          type: "warning",
          message: "Quantity must be greater than zero.",
        });
        return;
      }
    }

    try {
      const ingredientIds = recipe
        .map((item) => item.ingredient)
        .filter(Boolean);

      if (new Set(ingredientIds).size !== ingredientIds.length) {
        setNotification({
          show: true,
          type: "warning",
          message: "Duplicate ingredients are not allowed.",
        });
        return;
      }

      const payload = recipe.map((item) => ({
        ingredient: Number(item.ingredient),
        quantity: Number(item.quantity),
        allow_substitution: item.allow_substitution,
        alternatives: item.alternative_ids || [],
      }));

      await saveRecipe(product.id, payload);
      await loadData();
      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.error || "Unable to save recipe.",
      });
    }
  };

  const updateAlternatives = (id, alternativeIds) => {
    setRecipe(
      recipe.map((item) =>
        item.id === id
          ? {
              ...item,
              alternative_ids: alternativeIds,
            }
          : item
      )
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* 🟩 True Widescreen Horizontal Card Container */}
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Pinned Header Panel */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              {product.name}
            </h1>
            <p className="text-sm font-semibold text-indigo-600/80 mt-0.5 uppercase tracking-wider">
              Recipe Builder Dashboard
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Workstation Area: Dynamic recipes stack here without expanding the parent frame */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/40 space-y-4">
          {loading ? (
            <div className="text-center py-12 font-semibold text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-3xs">
              <span className="inline-block animate-pulse">Loading ingredients system...</span>
            </div>
          ) : (
            <>
              {recipe.length === 0 && (
                <div className="text-center py-12 font-bold text-slate-400 bg-white/60 border border-dashed border-slate-200 rounded-2xl uppercase tracking-wider text-xs">
                  No ingredients added yet.
                </div>
              )}

              {recipe.map((item) => (
                <RecipeRow
                  key={item.id}
                  item={item}
                  ingredients={ingredients}
                  onChange={updateRecipe}
                  onDelete={deleteIngredient}
                  onAlternativeChange={updateAlternatives}
                />
              ))}
            </>
          )}

          {/* Quick Add Block locked cleanly inline with active list tracks */}
          <div className="pt-2">
            <button
              onClick={addIngredient}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-all cursor-pointer shadow-3xs"
            >
              + Add Ingredient Track
            </button>
          </div>
        </div>

        {/* Locked Action Footer Control Panel Bar */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-bold text-sm shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            Save Formula Arrangement
          </button>
        </div>

      </div>

      {/* 🚀 FIXED: Injected Notification inside the markup root so syntax compiles cleanly */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </div>,document.body
  );
}

export default RecipeModal;
