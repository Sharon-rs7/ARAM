import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({
  className = "",
  size = "md",
  ...props
}) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div
      className={`flex items-center justify-center p-8 ${className}`}
      {...props}
    >
      <Loader2 className={`animate-spin text-blue-600 ${selectedSize}`} />
    </div>
  );
};

export default Loader;
