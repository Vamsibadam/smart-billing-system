import { createPortal } from "react-dom";

function FloatingCheckoutButton({
  total,
  visible,
  onClick,
}) {
  if (!visible) return null;

  return createPortal(

    <div className="fixed bottom-6 right-6 z-[9999]">

      <button
        onClick={onClick}
        className="
        bg-gradient-to-r
        from-orange-500
        to-indigo-600
        text-white
        px-8
        py-4
        rounded-full
        shadow-2xl
        text-lg
        font-black
        hover:scale-105
        transition-all
        cursor-pointer
        "
      >
        🛒 Checkout ₹{total.toFixed(2)}
      </button>

    </div>,

    document.body

  );
}

export default FloatingCheckoutButton;