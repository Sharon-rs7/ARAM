import React from "react";

const Input = ({
  label,
  error,
  icon: Icon,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-[#18332B] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B9690]">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border border-[#E6E1D8] bg-[#FFFDF8] px-3.5 py-2.5 text-xs sm:text-sm text-[#18332B] placeholder-[#8B9690] focus:border-[#163D32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DCEBDD] transition ${Icon ? "pl-10" : ""} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}
    </div>
  );
};

export default Input;
