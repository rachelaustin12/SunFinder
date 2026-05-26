import { motion } from "framer-motion";

export default function LoadingState({ message = "Checking the sunshine...", subMessage = "Finding sunny pub gardens near you", onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      {/* Same smiley sun as hero */}
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ delay: 1, duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
        className="relative flex items-center justify-center"
      >
        {/* Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 bg-primary/25 rounded-full blur-2xl"
        />
        <motion.svg
          width="130" height="130" viewBox="0 0 120 120"
          aria-label="Sun holding a beer"
        >
          {/* Rotating triangular rays */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "60px 60px" }}
          >
            {[...Array(16)].map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const innerR = 34;
              const outerR = 54;
              const halfW = 5;
              const lRad = ((angle - halfW) * Math.PI) / 180;
              const rRad = ((angle + halfW) * Math.PI) / 180;
              const x1 = 60 + innerR * Math.cos(lRad);
              const y1 = 60 + innerR * Math.sin(lRad);
              const x2 = 60 + innerR * Math.cos(rRad);
              const y2 = 60 + innerR * Math.sin(rRad);
              const xTip = 60 + outerR * Math.cos(rad);
              const yTip = 60 + outerR * Math.sin(rad);
              return (
                <polygon
                  key={i}
                  points={`${x1},${y1} ${x2},${y2} ${xTip},${yTip}`}
                  fill="hsl(36 95% 52%)"
                />
              );
            })}
          </motion.g>
          {/* Sun circle */}
          <circle cx="60" cy="60" r="30" fill="hsl(36 95% 52%)" />
          {/* Eyes */}
          <circle cx="52" cy="56" r="3" fill="#1a1a1a" />
          <circle cx="68" cy="56" r="3" fill="#1a1a1a" />
          {/* Smile */}
          <path d="M50 66 Q60 75 70 66" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Beer */}
          <text x="72" y="75" fontSize="22" style={{ userSelect: "none" }}>🍺</text>
        </motion.svg>
      </motion.div>

      <div className="text-center space-y-2 max-w-xs">
        <p className="text-foreground font-semibold text-lg">{message}</p>
        <p className="text-sm text-muted-foreground">{subMessage}</p>
        <p className="text-xs text-muted-foreground">Using real sun positioning, garden orientation & local conditions to find the sunniest spots — worth the wait! ☀️</p>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs text-muted-foreground"
        >
          This can take a few seconds…
        </motion.p>
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