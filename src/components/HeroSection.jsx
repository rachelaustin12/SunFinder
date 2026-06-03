import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="text-center pt-12 pb-8 md:pt-20 md:pb-12 px-4">
      {/* Animated sun + beer emoji mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="inline-flex items-center justify-center mb-5">
        
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ delay: 0.8, duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
          className="relative flex items-center justify-center">
          
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-20 h-20 bg-primary/25 rounded-full blur-2xl" />
          
          {/* SVG Sun with triangular rays + face + beer */}
          <motion.svg
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ delay: 0.8, duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
            width="120" height="120" viewBox="0 0 120 120"
            className="relative z-10"
            aria-label="Sun holding a beer">
            
            {/* Rotating rays */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "60px 60px" }}>
              
              {[...Array(16)].map((_, i) => {
                const angle = i * 360 / 16;
                const rad = angle * Math.PI / 180;
                const innerR = 34;
                const outerR = 54;
                const halfW = 5;
                const lRad = (angle - halfW) * Math.PI / 180;
                const rRad = (angle + halfW) * Math.PI / 180;
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
                    fill="hsl(36 95% 52%)" />);


              })}
            </motion.g>
            {/* Sun circle */}
            <circle cx="60" cy="60" r="30" fill="hsl(36 95% 52%)" />
            {/* Eyes */}
            <circle cx="52" cy="56" r="3" fill="#1a1a1a" />
            <circle cx="68" cy="56" r="3" fill="#1a1a1a" />
            {/* Smile */}
            <path d="M50 66 Q60 75 70 66" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Beer mug arm */}
            <text x="72" y="75" fontSize="22" style={{ userSelect: "none" }}>🍺</text>
          </motion.svg>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="font-display text-4xl md:text-6xl tracking-tight leading-tight font-extrabold text-[hsl(var(--chart-3))]">
        
        Sun<span className="text-primary"> Finder</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-4 text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
        
        Discover which pub gardens near you are basking in sunshine right now.
      </motion.p>
    </div>);

}