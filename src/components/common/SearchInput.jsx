import React from "react";
import { Search, X } from "lucide-react";

/**
 * Standardized SearchInput component for ARAM Legal Aid.
 * Guarantees zero text-icon overlap across all viewports.
 * - Icon at left-4 (16px) centered vertically.
 * - Input padding-left pl-12 (48px) so placeholder/typed text never touches icon.
 */
const SearchInput = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  size = "md", // "sm" | "md" | "lg"
  disabled = false,
  ...props
}) => {
  const heightClasses = {
    sm: "h-9 text-xs",
    md: "h-11 text-xs sm:text-sm",
    lg: "h-13 text-sm"
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
        <Search size={iconSizes[size] || 18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 bg-white pl-12 pr-10 outline-none transition text-slate-800 font-medium placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          heightClasses[size] || heightClasses.md
        }`}
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
