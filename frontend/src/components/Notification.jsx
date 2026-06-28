function Notification({
  show,
  type = "success",
  message,
  onClose,
}) {
  if (!show) return null;

  const colors = {
    success:
      "bg-emerald-50 border-emerald-300 text-emerald-700",
    error:
      "bg-red-50 border-red-300 text-red-700",
    warning:
      "bg-amber-50 border-amber-300 text-amber-700",
    info:
      "bg-blue-50 border-blue-300 text-blue-700",
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right duration-300">
      <div
        className={`min-w-[340px] border rounded-2xl shadow-xl px-6 py-4 ${colors[type]}`}
      >
        <div className="flex justify-between items-start">
          <p className="font-semibold">
            {message}
          </p>

          <button
            onClick={onClose}
            className="ml-4 text-xl leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notification;