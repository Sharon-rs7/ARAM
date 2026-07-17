import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  title = "No data found",
  description = "There are no records matching your request.",
  icon: Icon = Inbox,
  actionLabel = "",
  onActionClick,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto ${className}`}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-550 max-w-xs leading-relaxed">{description}</p>
      
      {actionLabel && onActionClick && (
        <Button
          variant="secondary"
          onClick={onActionClick}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
