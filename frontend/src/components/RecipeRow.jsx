import AlternativeSelector from "./AlternativeSelector";
import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function RecipeRow({
  item,
  ingredients,
  onChange,
  onDelete,
  onAlternativeChange,
}) {
  const [search, setSearch] = useState(item.ingredient_name || "");
  const [showSearch, setShowSearch] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(item.ingredient_name || "");
  }, [item.ingredient_name]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, search]);

  const selectIngredient = (ingredient) => {
    onChange(item.id, "ingredient", ingredient.id);
    onChange(item.id, "ingredient_name", ingredient.name);
    onChange(item.id, "unit", ingredient.unit);
    setSearch(ingredient.name);
    setShowSearch(false);
  };

  return createPortal(
    <div 
      ref={containerRef} 
      className="
      relative
      bg-gradient-to-r from-white via-slate-50/30 to-slate-50/70
      border border-slate-200/60
      rounded-[20px] 
      p-4.5 
      mb-4 
      last:mb-0 
      shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]
      hover:shadow-[0_6px_25px_-5px_rgba(99,102,241,0.05)]
      hover:border-indigo-200/80
      transition-all 
      duration-300
      group
      "
    >
      {/* Decorative vertical tag line showing action status on hover */}
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-orange-400 to-indigo-500 rounded-r-md opacity-0 group-hover:opacity-100 transition-all duration-300" />

      <div className="flex flex-row items-center justify-between gap-4 pl-1">
        
        {/* Keyword Search Autocomplete Area */}
        <div className="flex-1 min-w-[280px] relative">
          <input
            value={search}
            placeholder="Search Ingredient..."
            onFocus={() => {
              setShowSearch(true);
              setHighlighted(0);
            }}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSearch(true);
              setHighlighted(0);
            }}
            onKeyDown={(e) => {
              if (!showSearch) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((prev) => Math.min(prev + 1, filteredIngredients.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((prev) => Math.max(prev - 1, 0));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredIngredients[highlighted]) {
                  selectIngredient(filteredIngredients[highlighted]);
                }
              }
              if (e.key === "Escape") {
                setShowSearch(false);
              }
            }}
            className="
            w-full 
            bg-white 
            border border-slate-200 
            rounded-xl 
            p-3.5 
            text-base 
            font-bold 
            text-slate-800 
            outline-none 
            focus:border-indigo-500 
            focus:shadow-[0_0_0_4px_rgba(99,102,241,0.06)]
            transition-all 
            placeholder:text-slate-400/80
            "
          />

          {/* Floating Dropdown Panel Overlay */}
          {showSearch && (
            <div className="absolute left-0 right-0 mt-2.5 bg-white border border-slate-100 rounded-2xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.08)] max-h-56 overflow-y-auto z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredIngredients.length === 0 ? (
                <div className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  No ingredients match
                </div>
              ) : (
                filteredIngredients.map((ingredient, index) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => selectIngredient(ingredient)}
                    className={`w-full text-left px-5 py-3 transition-all flex items-center justify-between cursor-pointer border-b border-slate-50 last:border-0 ${
                      highlighted === index
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-bold ${highlighted === index ? "text-white" : "text-slate-800"}`}>
                        {ingredient.name}
                      </div>
                      <div className={`font-mono text-[10px] font-semibold mt-0.5 tracking-wider uppercase ${highlighted === index ? "text-indigo-200" : "text-slate-400"}`}>
                        Unit: {ingredient.unit || "N/A"}
                      </div>
                    </div>

                    <div className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                      highlighted === index 
                        ? "bg-indigo-700/50 text-indigo-100 border-indigo-400/20" 
                        : "bg-slate-50 text-slate-400 border-slate-200/60"
                    }`}>
                      #{ingredient.id}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Measurement Group: Quantity & Unit Pill */}
        <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs group-hover:border-slate-300/80 transition-all">
          <input
            type="number"
            placeholder="0"
            value={item.quantity}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onChange(item.id, "quantity", e.target.value)}
            className="w-16 bg-transparent text-sm font-black text-slate-800 text-center outline-none p-2.5"
          />
          <span className="bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider min-w-[50px] text-center select-none border border-slate-100">
            {item.unit || "—"}
          </span>
        </div>

        {/* Substitute Toggle Button */}
        <div className="shrink-0">
          <label className="flex items-center justify-center gap-2 px-4 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl h-[54px] cursor-pointer transition-all shadow-2xs group select-none active:scale-98">
            <input
              type="checkbox"
              checked={item.allow_substitution}
              onChange={(e) => onChange(item.id, "allow_substitution", e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer transition-transform"
            />
            <span className="text-xs font-bold text-slate-600 tracking-tight group-hover:text-indigo-600 transition-colors whitespace-nowrap">
              Substitute
            </span>
          </label>
        </div>

        {/* Remove Action Button */}
        <div className="shrink-0">
          <button
            onClick={() => onDelete(item.id)}
            className="w-11 h-[54px] flex items-center justify-center bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-200 cursor-pointer border border-slate-200 hover:border-red-200 text-base font-medium shadow-2xs active:scale-95"
            title="Remove Item"
          >
            ✕
          </button>
        </div>

      </div>

      {/* Alternative Drawer Block */}
      {item.allow_substitution && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200/80 bg-slate-50/40 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
          <AlternativeSelector
            recipeItem={item}
            ingredients={ingredients}
            selected={item.alternative_ids || []}
            onChange={(ids) => onAlternativeChange(item.id, ids)}
          />
        </div>
      )}
    </div>,document.body
  );
}

export default RecipeRow;
