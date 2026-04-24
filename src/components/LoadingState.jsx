import { Sun, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-4"
    >
      <div className="relative">
        <Sun className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium">Checking the sunshine...</p>
        <p className="text-sm text-muted-foreground mt-1">Finding sunny pub gardens near you</p>
      </div>
    </motion.div>
  );
}