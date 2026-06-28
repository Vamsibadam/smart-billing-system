import { useMemo, useState, useRef, useEffect } from "react";

function AlternativeSelector({
  recipeItem,
  ingredients,
  selected,
  onChange,
}) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const dropdownRef = useRef(null);

  // Click outside listener to safely dismiss the search overlay
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter available items that aren't the primary ingredient and aren't already selected
  const availableIngredients = useMemo(() => {
    return ingredients.filter(
      (ingredient) =>
        ingredient.id !== recipeItem.ingredient &&
        !selected.includes(ingredient.id) &&
        ingredient.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, recipeItem.ingredient, selected, search]);

  const handleToggleAlternative = (ingredientId) => {
    const id = Number(ingredientId);
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAlternative = (ingredient) => {
    handleToggleAlternative(ingredient.id);
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div className="w-full bg-slate-50/60 rounded-xl p-4 border border-slate-200/60">
      
      {/* 🚀 Main Horizontal Layout Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Title descriptor */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Allowed Substitutions
          </p>
        </div>

        {/* Right Side: Keyboard-Search Autocomplete Input Column */}
        <div className="w-full sm:w-64 relative shrink-0" ref={dropdownRef}>
          <input
            type="text"
            value={search}
            placeholder="Type to search alternative..."
            onFocus={() => {
              setShowDropdown(true);
              setHighlighted(0);
            }}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
              setHighlighted(0);
            }}
            onKeyDown={(e) => {
              if (!showDropdown) return;
              
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((prev) =>
                  Math.min(prev + 1, availableIngredients.length - 1)
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((prev) => Math.max(prev - 1, 0));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (availableIngredients[highlighted]) {
                  selectAlternative(availableIngredients[highlighted]);
                }
              }
              if (e.key === "Escape") {
                setShowDropdown(false);
              }
            }}
            className="w-full bg-white border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 shadow-3xs"
          />

          {/* Floating Search Autocomplete Menu Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-100">
              {availableIngredients.length === 0 ? (
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase text-center">
                  No matching items
                </div>
              ) : (
                availableIngredients.map((ingredient, index) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => selectAlternative(ingredient)}
                    className={`w-full text-left px-3.5 py-2 transition-all flex items-center justify-between cursor-pointer border-b border-slate-50 last:border-0 ${
                      highlighted === index
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold">{ingredient.name}</span>
                    <span className={`font-mono text-[9px] font-black uppercase tracking-wider ${highlighted === index ? "text-indigo-200" : "text-slate-400"}`}>
                      {ingredient.unit || "PCS"}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* 🚀 Active Horizontal Tag Bar (Displays below) */}
      {selected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/40 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
            Active:
          </span>
          
          {selected.map((id) => {
            const ingredient = ingredients.find((i) => i.id === id);
            if (!ingredient) return null;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleToggleAlternative(id)}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-red-50 text-indigo-700 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100/50 hover:border-red-200 transition-all cursor-pointer group shadow-3xs"
                title="Click to clear substitute"
              >
                <span>{ingredient.name}</span>
                <span className="text-indigo-400 group-hover:text-red-400 font-medium">✕</span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default AlternativeSelector;
