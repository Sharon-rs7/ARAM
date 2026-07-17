import { useEffect, useRef } from "react";

export default function usePolling(callback, delayMs = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    
    // Initial immediate call
    savedCallback.current();

    const id = setInterval(() => {
      savedCallback.current();
    }, delayMs);

    return () => clearInterval(id);
  }, [delayMs]);
}
