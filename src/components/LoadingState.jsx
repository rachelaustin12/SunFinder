import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingState({ message = "Checking the sunshine...", onCancel }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    const start = Date.now();
    const duration = 8000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(95, 95 * (1 - Math.exp(-3.5 * elapsed / duration)));
      setFill(progress);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      <div className="text-center space-y-3 max-w-xs">
        <p className="text-foreground font-semibold text-lg">{message}</p>
        <p className="text-sm text-muted-foreground">
          {fill < 30 ? "Scouting gardens nearby…" : fill < 65 ? "Calculating sun positions…" : "Almost there, nearly sunny! ☀️"}
        </p>

        {/* Progress bar */}
        <div className="mx-auto mt-2 h-2 w-48 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            style={{ width: `${fill}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          Using real sun positioning & garden orientation to find the sunniest spots — worth the wait! ☀️
        </p>
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