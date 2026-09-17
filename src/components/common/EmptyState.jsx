import React from "react";
import Button from "@/components/common/Button";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#DCEBDD]/60 text-[#163D32] flex items-center justify-center mb-4">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-lg font-bold text-[#18332B] mb-2">{title}</h3>
      <p className="text-xs text-[#65736D] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
