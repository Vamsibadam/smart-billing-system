import React from "react";
import { 
  Trash2, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  PauseCircle,
  Clock
} from "lucide-react";

function CartPanel({
  cart = [],
  totalAmount = 0,
  subtotalAmount = 0,
  productDiscountAmount = 0,
  discountAmount = 0,
  updateQuantity,
  removeItem,
  generateBill,
  holdBill,
  setShowHeldBills,
  setSelectedCartItem,
  setShowCustomize,
  setComboCartItem,
  setShowComboCustomize,
}) {
  const handleOpenCustomize = (item) => {
    if (item.product_type === "COMBO") {
      setComboCartItem(item);
      setShowComboCustomize(true);
    } else {
      setSelectedCartItem(item);
      setShowCustomize(true);
    }
  };

  const handleIncrement = (item) => {
    const currentQty = Number(item.quantity) || 1;
    updateQuantity(item.id, currentQty + 1);
  };

  const handleDecrement = (item) => {
    const currentQty = Number(item.quantity) || 1;
    if (currentQty > 1) {
      updateQuantity(item.id, currentQty - 1);
    } else {
      removeItem(item.id);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-300/30 via-white to-indigo-300/30 backdrop-blur-md border border-white rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
            Cart
          </h2>
          {cart.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
              <Sparkles size={10} /> {cart.length} {cart.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-xs sm:text-sm font-bold text-slate-400 py-10 sm:py-12 text-center bg-white/40 border border-dashed border-slate-200 rounded-2xl uppercase tracking-wider">
          No Items Added
        </div>
      ) : (
        <>
          {/* =========================================================
              HANDY MOBILE CARDS (Screen < md)
          ========================================================== */}
          <div className="block md:hidden space-y-2.5">
            {cart.map((item) => {
              const itemTotal = (Number(item.price) * (Number(item.quantity) || 1)).toFixed(2);
              const isCombo = item.product_type === "COMBO";

              return (
                <div
                  key={item.id}
                  className="
                    relative
                    overflow-hidden
                    rounded-[20px]
                    bg-white
                    p-3.5
                    border border-slate-200/70
                    shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]
                    transition-all
                    active:scale-[0.99]
                    space-y-3
                  "
                >
                  {/* Left Accent Spine */}
                  <div
                    className={`absolute left-0 inset-y-0 w-1.5 ${
                      isCombo
                        ? "bg-gradient-to-b from-orange-500 to-amber-500"
                        : "bg-gradient-to-b from-indigo-500 to-cyan-400"
                    }`}
                  />

                  {/* Top: Name, Tag, Unit Price & Delete */}
                  <div className="flex items-start justify-between gap-2 pl-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isCombo ? (
                          <span className="rounded-md bg-orange-50 border border-orange-200/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-600">
                            Combo Pack
                          </span>
                        ) : (
                          <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-700">
                            Standard
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          #{item.id}
                        </span>
                      </div>

                      <h3 className="mt-1 text-sm font-black text-slate-800 truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        ₹{item.price} <span className="font-normal text-slate-400">/ unit</span>
                      </p>
                    </div>

                    {/* Total Capsule */}
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                        Subtotal
                      </span>
                      <span className="text-sm font-black text-slate-900 mt-1 block">
                        ₹{itemTotal}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Stepper + Customize Options + Delete */}
                  <div className="flex items-center justify-between border-t border-slate-100/90 pt-2.5 pl-1.5 gap-2">
                    {/* Handy Stepper Pill */}
                    <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-90 transition cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        className="w-9 bg-transparent text-center text-xs font-black text-slate-800 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleIncrement(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-90 transition cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Customize Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenCustomize(item)}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
                      >
                        <SlidersHorizontal size={12} />
                        <span>Options</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-95 transition cursor-pointer shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              DESKTOP STRUCTURED TABLE (Screen >= md) — 100% UNTOUCHED
          ========================================================== */}
          <div className="hidden md:block overflow-x-auto max-w-full">
            <table className="w-full text-sm">
              <thead className="text-slate-400 font-black text-[13px] tracking-wider uppercase">
                <tr>
                  <th className="pb-3 text-left pl-2">Product</th>
                  <th className="pb-3 text-center w-24">Qty</th>
                  <th className="pb-3 text-center w-28">Options</th>
                  <th className="pb-3 text-center w-24">Price</th>
                  <th className="pb-3 text-center w-24">Total</th>
                  <th className="pb-3 text-center w-24">Action</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-all duration-150 bg-white/60 border-slate-500 rounded-l-xl hover:bg-white"
                  >
                    <td className="p-3.5 font-bold text-slate-700 rounded-l-xl text-lg">
                      {item.name}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (item.product_type === "COMBO") {
                            setComboCartItem(item);
                            setShowComboCustomize(true);
                          } else {
                            setSelectedCartItem(item);
                            setShowCustomize(true);
                          }
                        }}
                        className="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Customize
                      </button>
                    </td>

                    <td className="p-3 text-center font-bold text-slate-400">
                      ₹{item.price}
                    </td>

                    <td className="p-3 text-center font-black text-slate-800">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </td>

                    <td className="p-3 text-center rounded-r-xl">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-s text-red-500 font-black hover:text-red-600 px-2 py-1 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =========================================================
          TOTALS & ACTIONS
      ========================================================== */}
      <div className="mt-4 sm:mt-6 border-t border-slate-200/50 pt-3.5 sm:pt-5">
        <div className="space-y-1.5 mb-3.5">
          {/* Product Discount */}
          {productDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-600">
                Product Discount
              </span>
              <span className="font-black text-emerald-600">
                -₹{productDiscountAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Direct Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-600">
                Bill Discount
              </span>
              <span className="font-black text-indigo-600">
                -₹{discountAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-end bg-white/70 border border-slate-200/70 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Grand Total
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-0.5">
              ₹{totalAmount.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={generateBill}
            disabled={cart.length === 0}
            className="
              flex-1 
              bg-gradient-to-r from-orange-500 to-indigo-600 
              text-white 
              py-3 sm:py-3.5 
              rounded-xl 
              text-xs sm:text-sm 
              font-black 
              tracking-wide 
              shadow-sm 
              hover:opacity-95 
              active:scale-[0.98] 
              transition-all 
              duration-200 
              cursor-pointer
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex items-center justify-center gap-1.5
            "
          >
            <span>Generate Bill</span>
            <ArrowRight size={15} />
          </button>

          <div className="flex gap-2 sm:contents">
            <button
              type="button"
              onClick={holdBill}
              disabled={cart.length === 0}
              className="
                flex-1 sm:flex-initial
                bg-slate-500 
                text-white 
                px-4 sm:px-5 
                py-2.5 sm:py-3.5 
                rounded-xl 
                text-xs sm:text-sm 
                font-bold 
                tracking-wide 
                shadow-sm 
                hover:bg-slate-700 
                active:scale-[0.98] 
                transition-all 
                duration-200 
                cursor-pointer 
                text-center
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex items-center justify-center gap-1
              "
            >
              <PauseCircle size={14} />
              <span>Hold Bill</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHeldBills(true)}
              className="
                flex-1 sm:flex-initial
                bg-slate-500 
                text-white 
                px-4 sm:px-5 
                py-2.5 sm:py-3.5 
                rounded-xl 
                text-xs sm:text-sm 
                font-bold 
                tracking-wide 
                shadow-sm 
                hover:bg-slate-700 
                active:scale-[0.98] 
                transition-all 
                duration-200 
                cursor-pointer 
                text-center
                flex items-center justify-center gap-1
              "
            >
              <Clock size={14} />
              <span>View Held</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPanel;