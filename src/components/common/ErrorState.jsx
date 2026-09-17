import React from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";

const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an error loading this information. Please check your connection and try again.",
  onRetry,
  className = "",
  showGoHome = true,
  ...props
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-2xl bg-red-50/30 max-w-md mx-auto ${className}`}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 animate-bounce">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-xs text-slate-500 max-w-xs leading-relaxed">{message}</p>
      
      <div className="flex gap-3 mt-6">
        {onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="flex items-center gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
          >
            <RotateCcw size={14} />
            Retry
          </Button>
        )}
        
        {showGoHome && (
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-650 hover:bg-slate-100"
          >
            <Home size={14} />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
