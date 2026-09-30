import { createPortal } from "react-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

function FloatingCheckoutButton({ total = 0, visible, onClick }) {
  if (!visible) return null;

  return createPortal(
    <div
      className="
        fixed
        bottom-20 sm:bottom-6
        inset-x-3.5 sm:inset-x-auto sm:right-6
        z-[9999]
        flex justify-center
        pointer-events-none
      "
    >
      <button
        type="button"
        onClick={onClick}
        className="
          pointer-events-auto
          w-full sm:w-auto
          flex items-center justify-between sm:justify-center gap-3 sm:gap-3.5
          bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600
          text-white
          px-4 sm:px-8
          py-3 sm:py-4
          rounded-2xl sm:rounded-full
          shadow-[0_12px_32px_-6px_rgba(249,115,22,0.45),0_6px_16px_-4px_rgba(99,102,241,0.35)]
          border border-white/20
          backdrop-blur-sm
          active:scale-[0.97]
          hover:scale-[1.02]
          transition-all
          duration-200
          cursor-pointer
          select-none
        "
      >
        {/* Left side: Bag Icon & Label */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <ShoppingBag size={17} className="text-white" />
          </div>
          <div className="text-left">
            <span className="block text-xs sm:text-sm font-black uppercase tracking-wider leading-none">
              Checkout
            </span>
            <span className="block text-[10px] text-white/80 font-semibold sm:hidden mt-0.5">
              Tap to view order
            </span>
          </div>
        </div>

        {/* Right side: Amount Capsule & Arrow */}
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-950/30 px-3 py-1 text-sm sm:text-base font-black tracking-tight text-white">
            ₹{Number(total).toFixed(2)}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </button>
    </div>,
    document.body
  );
}

export default FloatingCheckoutButton;