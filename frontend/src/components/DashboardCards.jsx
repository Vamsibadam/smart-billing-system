function DashboardCards({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300">

      <p className="text-slate-500 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-slate-800 mt-2">
        {value}
      </h2>

    </div>
  );
}

export default DashboardCards;