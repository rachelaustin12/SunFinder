import { useEffect, useRef, useState, useCallback } from "react";

export function usePullToRefresh(onRefresh, enabled = true) {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const startY = useRef(null);
  const pullingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const THRESHOLD = 70;

  // Keep ref in sync without triggering effect re-runs
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

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
        const clamped = Math.min(dy, THRESHOLD + 20);
        setDistance(clamped);
        const isPulling = dy >= THRESHOLD;
        pullingRef.current = isPulling;
        setPulling(isPulling);
      }
    };

    const onTouchEnd = () => {
      if (pullingRef.current) onRefreshRef.current();
      startY.current = null;
      pullingRef.current = false;
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
  }, [enabled]); // only re-run when enabled changes

  return { pulling, distance, threshold: THRESHOLD };
}