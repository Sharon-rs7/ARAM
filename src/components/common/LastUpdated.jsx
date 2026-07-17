import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function LastUpdated({ trigger }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [trigger]);

  const getLabel = () => {
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
      <Clock size={12} className="shrink-0" />
      <span>Last updated {getLabel()}</span>
    </div>
  );
}
