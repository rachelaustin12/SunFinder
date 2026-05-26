import { motion } from "framer-motion";

export default function LoadingState({ message = "Checking the sunshine...", subMessage = "Finding sunny pub gardens near you", onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Glow */}
        <div className="absolute w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        {/* Rotating rays ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-20 h-20"
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-4 bg-primary/50 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "0 -32px",
                transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-32px)`,
              }}
            />
          ))}
        </motion.div>
        {/* Sun core — slow pulse */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl select-none">☀️</span>
        </motion.div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-foreground font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">{subMessage}</p>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs text-muted-foreground mt-2"
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