function CategoryRibbon({
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`rounded-2xl px-6 py-3 font-bold whitespace-nowrap transition-all ${
          selectedCategory === null
            ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-lg"
            : "border border-slate-200 bg-white hover:border-orange-400"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`rounded-3xl px-7 py-5 text-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === category.id
              ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-lg"
              : "border border-slate-200 bg-white hover:border-orange-400"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryRibbon;
