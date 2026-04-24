import { Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="text-center pt-12 pb-8 md:pt-20 md:pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 mb-6"
      >
        <div className="relative">
          <Sun className="w-10 h-10 text-primary animate-pulse-glow" />
          <div className="absolute inset-0 w-10 h-10 bg-primary/20 rounded-full blur-xl" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight"
      >
        Where's
        <span className="text-primary"> The Sun?</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed"
      >
        Discover which pub gardens near you are basking in sunshine right now.
      </motion.p>
    </div>
  );
}