import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh, enabled = true) {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const startY = useRef(null);
  const THRESHOLD = 70;

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY === 0) {
        setDistance(Math.min(dy, THRESHOLD + 20));
        setPulling(dy >= THRESHOLD);
      }
    };

    const onTouchEnd = () => {
      if (pulling) onRefresh();
      startY.current = null;
      setDistance(0);
      setPulling(false);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pulling, onRefresh, enabled]);

  return { pulling, distance, threshold: THRESHOLD };
}