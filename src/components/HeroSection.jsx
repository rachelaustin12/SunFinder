import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="text-center pt-12 pb-8 md:pt-20 md:pb-12 px-4">
      {/* Animated sun + beer emoji mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="inline-flex items-center justify-center mb-5"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ delay: 0.8, duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
          className="relative flex items-center justify-center"
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-20 h-20 bg-primary/25 rounded-full blur-2xl"
          />
          {/* Sun rays ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
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
                  transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-32px)`,
                }}
              />
            ))}
          </motion.div>
          {/* Sun face */}
          <div className="relative z-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-3xl select-none" role="img" aria-label="Sun holding a beer">🍺</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight"
      >
        Sun<span className="text-primary"> Finder</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-4 text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed"
      >
        Discover which pub gardens near you are basking in sunshine right now.
      </motion.p>
    </div>
  );
}