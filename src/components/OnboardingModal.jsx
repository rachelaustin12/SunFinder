import { useState, useEffect } from "react";
import { Sun, MapPin, Heart, Footprints, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "wheres_the_sun_onboarded";

const steps = [
  {
    icon: Sun,
    title: "Find pubs in the sunshine",
    body: "Search for any area, city or postcode and we'll show you which pub gardens are most likely to be basking in sun right now.",
  },
  {
    icon: MapPin,
    title: "Plan ahead",
    body: "Use the time & date picker to check which gardens will be sunny later today — or later this week. Great for booking ahead.",
  },
  {
    icon: Heart,
    title: "Save your favourites",
    body: "Tap the ♥ on any pub to save it to 'Faves' so you can find your go-to sunny spots quickly.",
  },
  {
    icon: Footprints,
    title: "Build a pub crawl",
    body: "Head to 'Sunny Strolls' to get AI-generated sunny pub crawl routes — or create and save your own custom route.",
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
            {/* Close */}
            <div className="flex justify-end px-5 pt-4">
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 pt-2 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">{current.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
                </motion.div>
              </AnimatePresence>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6 mb-5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${i === step ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {step < steps.length - 1 ? (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                ) : (
                  "Let's find some sunshine ☀️"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}