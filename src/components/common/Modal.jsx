import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen = false,
  onClose,
  title = "",
  children,
  className = "",
  ...props
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      {...props}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content Container */}
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all scale-100 max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="text-sm text-slate-650 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
