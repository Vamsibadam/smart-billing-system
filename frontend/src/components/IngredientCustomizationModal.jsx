import { useState } from "react";
import { createPortal } from "react-dom";
function IngredientCustomizationModal({
  product,
  recipeGroups,
  overrides,
  onSave,
  onClose,
}) {
  const [selectedOverrides, setSelectedOverrides] = useState(
    overrides || []
  );

  const handleChange = (
    recipeIngredientId,
    ingredientId
  ) => {
    setSelectedOverrides((prev) => [
      ...prev.filter(
        (item) =>
          item.recipe_ingredient_id !== recipeIngredientId
      ),
      {
        recipe_ingredient_id: recipeIngredientId,
        ingredient_id: Number(ingredientId),
      },
    ]);
  };

  return createPortal(
   <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-center items-center z-50 p-3">
  {/* Sized down modal container base elements slightly */}
  <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
    
    {/* Compact Header Block */}
    <div className="px-6 py-4 border-b border-slate-100 bg-white">
      <h2 className="text-xl font-black tracking-tight text-slate-800">
        {product.name}
      </h2>
      <p className="text-[11px] font-bold text-indigo-600/80 mt-0.5 uppercase tracking-wider">
        Customize Ingredients
      </p>
    </div>

    {/* Compact main scrolling view bounds */}
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40 space-y-4">
      {recipeGroups.map((group) => (
        <div
          key={group.product_id}
          className="bg-white border border-slate-200/50 rounded-xl p-4 shadow-3xs"
        >
          <h3 className="text-sm font-black text-slate-700 mb-3 border-b border-slate-100 pb-2 tracking-tight flex items-center gap-1.5">
            <span className="w-1 h-3 bg-orange-500 rounded-full" />
            {group.product_name}
          </h3>

          {/* Grid Layout Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.recipe.map((item) => {
              const currentSelectedId = selectedOverrides.find(
                (override) => override.recipe_ingredient_id === item.id
              )?.ingredient_id || item.ingredient;

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/40 border border-slate-200/50 rounded-lg p-3 flex flex-col justify-between transition-all hover:bg-white"
                >
                  {/* Smaller ingredient label */}
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    {item.ingredient_name}
                  </div>

                  {/* 🚀 UP-SCALED: Significantly larger choice changer area */}
                  {item.allow_substitution && item.alternatives.length > 0 ? (
                    <div className="relative mt-0.5">
                      <select
                        className="w-full bg-white border-2 border-indigo-200 rounded-xl p-4 text-base font-black text-indigo-900 outline-none focus:border-indigo-600 focus:bg-indigo-50/20 transition-all appearance-none cursor-pointer pr-10 shadow-sm"
                        value={currentSelectedId}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                      >
                        <option value={item.ingredient}>
                          {item.ingredient_name} (Default)
                        </option>
                        {item.alternatives.map((alternative) => (
                          <option
                            key={alternative.id}
                            value={alternative.ingredient}
                          >
                            {alternative.ingredient_name}
                          </option>
                        ))}
                      </select>
                      {/* Scaled selector icon arrow pointer */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-indigo-500 text-xs font-black">
                        ▼
                      </div>
                    </div>
                    
                  ) : (
                    /* Scaled down passive state element */
                    <div className="inline-flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-lg py-2.5 text-center border border-slate-200/20">
                      Fixed / No Substitutions
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    {/* Compact Action Footer Bar */}
    <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <button
        onClick={onClose}
        className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
      >
        Cancel
      </button>

      <button
        onClick={() => onSave(selectedOverrides)}
        className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
      >
        Save Configuration
      </button>
    </div>

  </div>
</div>,document.body

  );
}

export default IngredientCustomizationModal;