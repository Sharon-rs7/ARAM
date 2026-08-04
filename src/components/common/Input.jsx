import React from "react";
import { Info } from "lucide-react";

const Input = ({
  label = "",
  type = "text",
  name = "",
  value = "",
  onChange,
  placeholder = "",
  required = false,
  error = "",
  className = "",
  icon: Icon = null,
  rightElement = null,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`h-11 w-full rounded-xl border outline-none text-xs transition text-slate-800 focus:ring-4 focus:ring-blue-50/50 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${
            rightElement ? "pr-10" : "pr-3.5"
          } ${
            error 
              ? "border-red-400 focus:border-red-500 focus:ring-red-50/50" 
              : "border-slate-200 focus:border-blue-500"
          }`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1.5 flex items-start gap-1 text-[11px] text-red-600 leading-relaxed">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;

