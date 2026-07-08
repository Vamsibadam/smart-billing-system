import { createPortal } from "react-dom";

function TouchCartDrawer({
  open,
  onClose,
  children,
}) {
  if (!open) return null;

  return createPortal(

    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div
        className="
        relative
        bg-white
        rounded-3xl
        w-full
        max-w-5xl
        max-h-[90vh]
        overflow-y-auto
        shadow-2xl
        animate-in
        fade-in
        zoom-in-95
        duration-200
        "
      >

        {children}

      </div>

    </div>,

    document.body

  );
}

export default TouchCartDrawer;