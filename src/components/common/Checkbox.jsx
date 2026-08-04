import React from "react";

/**
 * Standardized Checkbox component for ARAM Legal Aid.
 * Enforces perfect flex alignment, touch targets, and typography consistency.
 */
const Checkbox = ({
  id,
  name,
  checked = false,
  onChange,
  label = "",
  description = "",
  disabled = false,
  className = "",
  ...props
}) => {
  const checkboxId = id || name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative flex items-center h-5 mt-0.5">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="h-4.5 w-4.5 shrink-0 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
          {...props}
        />
      </div>
      {(label || description) && (
        <label htmlFor={checkboxId} className="text-xs leading-relaxed text-slate-600 font-medium cursor-pointer">
          {label && <span className="block text-slate-800 font-semibold">{label}</span>}
          {description && <span className="block text-slate-500 mt-0.5">{description}</span>}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
