import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from 0 to `target` over `duration` ms,
 * using requestAnimationFrame for a smooth 60fps count instead of a
 * choppy setInterval. No extra dependency needed for something this
 * small — a counting number is a surprisingly strong "premium SaaS"
 * signal on a stats section, far more than its complexity suggests.
 */
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (typeof target !== "number") return;
    startRef.current = null;

    let frameId;
    const step = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // easeOutCubic — fast start, gentle settle, feels less mechanical than linear
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}