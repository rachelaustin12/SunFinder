import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingState({ message = "Checking the sunshine...", onCancel }) {
  // Simulate fill progress over ~8 seconds
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    const start = Date.now();
    const duration = 8000; // ms to reach ~95%
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      // Ease-out curve: fast at first, slows near the end, caps at 95
      const progress = Math.min(95, 95 * (1 - Math.exp(-3.5 * elapsed / duration)));
      setFill(progress);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // The fill goes bottom-to-top inside the circle (r=30, cx=60, cy=60)
  // clipPath height goes from 0 → 60 (diameter) based on fill %
  const clipY = 60 + 30 - (fill / 100) * 60; // top of the yellow fill rect

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      <div className="relative flex items-center justify-center">
        {/* Glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 bg-primary/25 rounded-full blur-2xl"
        />

        <svg width="140" height="140" viewBox="0 0 120 120" aria-label="Loading — sun filling with sunshine">
          <defs>
            {/* Clip to the sun circle for the fill effect */}
            <clipPath id="sunFillClip">
              <circle cx="60" cy="60" r="30" />
            </clipPath>
          </defs>

          {/* Rotating rays */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "60px 60px" }}
          >
            {[...Array(16)].map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const innerR = 34, outerR = 54, halfW = 5;
              const lRad = ((angle - halfW) * Math.PI) / 180;
              const rRad = ((angle + halfW) * Math.PI) / 180;
              const x1 = 60 + innerR * Math.cos(lRad), y1 = 60 + innerR * Math.sin(lRad);
              const x2 = 60 + innerR * Math.cos(rRad), y2 = 60 + innerR * Math.sin(rRad);
              const xTip = 60 + outerR * Math.cos(rad), yTip = 60 + outerR * Math.sin(rad);
              // Rays fade from pale to full gold as fill rises
              const rayOpacity = 0.3 + (fill / 100) * 0.7;
              return (
                <polygon
                  key={i}
                  points={`${x1},${y1} ${x2},${y2} ${xTip},${yTip}`}
                  fill={`hsl(36 95% 52%)`}
                  opacity={rayOpacity}
                />
              );
            })}
          </motion.g>

          {/* Sun circle — pale base */}
          <circle cx="60" cy="60" r="30" fill="hsl(45 80% 90%)" />

          {/* Animated yellow fill rising from bottom */}
          <motion.rect
            x="30"
            y={clipY}
            width="60"
            height={60}
            fill="hsl(36 95% 52%)"
            clipPath="url(#sunFillClip)"
            animate={{ y: clipY }}
            transition={{ duration: 0.05 }}
          />

          {/* Ripple at the fill waterline */}
          {fill > 2 && fill < 98 && (
            <motion.ellipse
              cx="60"
              cy={clipY}
              rx="28"
              ry="3"
              fill="hsl(36 95% 65%)"
              clipPath="url(#sunFillClip)"
              animate={{ rx: [26, 29, 26], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Face — always on top */}
          <circle cx="52" cy="56" r="3" fill="#1a1a1a" />
          <circle cx="68" cy="56" r="3" fill="#1a1a1a" />
          <path d="M50 66 Q60 75 70 66" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Beer — always on top */}
          <text x="72" y="75" fontSize="22" style={{ userSelect: "none" }}>🍺</text>
        </svg>
      </div>

      {/* Fill % label */}
      <div className="text-center space-y-1.5 max-w-xs">
        <p className="text-foreground font-semibold text-lg">{message}</p>
        <p className="text-sm text-muted-foreground">
          {fill < 30 ? "Scouting gardens nearby…" : fill < 65 ? "Calculating sun positions…" : "Almost there, nearly sunny! ☀️"}
        </p>
        <motion.div
          className="mx-auto mt-1 h-1 w-32 rounded-full bg-muted overflow-hidden"
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            style={{ width: `${fill}%` }}
          />
        </motion.div>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-2 px-5 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          Cancel search
        </button>
      )}
    </motion.div>
  );
}