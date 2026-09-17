import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
  showClose = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#163D32]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 shadow-2xl transition-all z-10 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-4 mb-4">
          <h3 className="text-base font-extrabold text-[#18332B]">{title}</h3>
          {showClose && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#8B9690] hover:bg-[#DCEBDD]/40 hover:text-[#18332B] transition"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
