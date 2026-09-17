import React from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Search legal aid topics, sections, schemes...",
  className = ""
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-[#8B9690] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-full border border-[#E6E1D8] bg-[#FFFDF8] text-xs text-[#18332B] placeholder-[#8B9690] focus:outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] transition"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          type="button"
          className="absolute right-3.5 p-1 text-[#8B9690] hover:text-[#18332B] rounded-full"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
