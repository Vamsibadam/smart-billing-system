import { createPortal } from "react-dom";
import { useEffect, useState, useRef } from "react";

function QuantityDialog({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onUpdate,
  onRemove,
  onClose,
}) {
  if (!product) return null;
  const [inputQuantity, setInputQuantity] = useState(quantity);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputQuantity(quantity);
  }, [quantity]);

  const handleUpdate = () => {
    const finalQty = Math.max(1, Number(inputQuantity) || 1);
    onUpdate(finalQty);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[32px] border border-white bg-white p-6 shadow-2xl transition-all">
        {/* Header Section */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">
            Adjust Quantity
          </span>
          <h2 className="mt-2 line-clamp-2 text-xl font-black text-slate-800">
            {product.name}
          </h2>
        </div>

        {/* Counter controls row */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-2 border border-slate-100">
          <button
            type="button"
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-white text-xl font-black text-slate-700 shadow-sm transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>

          <div className="text-3xl font-black tracking-tight text-slate-800">
            {quantity}
          </div>

          <button
            type="button"
            onClick={onIncrease}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-white text-xl font-black text-slate-700 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
          >
            +
          </button>
        </div>

        {/* Keypad Manual Entry Form Field */}
        <div className="mt-5">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Manual Keypad Input
          </label>
          <div className="relative mt-1.5 flex gap-2">
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={inputQuantity}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setInputQuantity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-center text-lg font-black text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="cursor-pointer rounded-xl bg-indigo-600 px-5 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 text-sm whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Footer Actions Layout System */}
        <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-orange-500 to-indigo-600 py-3.5 text-sm font-black tracking-wide text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
          >
            Done
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="w-full cursor-pointer rounded-2xl bg-red-50 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-100 hover:text-red-600"
          >
            Remove from Cart
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QuantityDialog;
