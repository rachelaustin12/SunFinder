import { Sun, MapPin, Brain, CloudSun, Star, Footprints, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    icon: Sun,
    title: "What is Where's The Sun?",
    body: "Where's The Sun helps you find pub gardens that are likely to be in sunshine right now — or at any time you choose. Just search your area and we'll rank nearby pubs by how sunny their outdoor space is likely to be.",
  },
  {
    icon: Brain,
    title: "How does the AI work?",
    body: "We use AI to analyse each pub's garden orientation, surrounding buildings, the current time of day, and the season to estimate whether it's in sun or shade. The AI searches real pub data to give you accurate names and addresses.",
  },
  {
    icon: AlertTriangle,
    title: "Important: these are estimates",
    body: "Sun positions are calculated based on typical conditions — we don't have live cameras at every beer garden! Results are a best guess based on orientation and time of day. Tall buildings, trees, and unusual weather can all affect reality. Always worth calling ahead for important occasions.",
    highlight: true,
  },
  {
    icon: CloudSun,
    title: "Plan ahead",
    body: "Use the date and time picker on the search page to check which gardens will catch the sun later today, tomorrow, or later this week — perfect for planning ahead before you head out.",
  },
  {
    icon: Star,
    title: "Reviews & Top Rated",
    body: "Real users can leave reviews and sun ratings for pubs they've visited. The 'Top Rated' tab shows the highest-rated sunny spots in any area, based on community reviews.",
  },
  {
    icon: Footprints,
    title: "Sunny Strolls",
    body: "The Sunny Strolls section generates AI pub crawl routes that follow the sun through the day. You can also create and save your own custom pub crawl routes with drag-and-drop stop ordering.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <Sun className="w-8 h-8 text-primary animate-pulse-glow" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            Everything you need to know about finding your perfect sunny pint.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-2xl p-5 border ${
                  section.highlight
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40"
                    : "bg-card border-border/60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    section.highlight ? "bg-amber-100 dark:bg-amber-900/40" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${section.highlight ? "text-amber-600 dark:text-amber-400" : "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-muted-foreground">
            Built for sun-seekers across the UK 🇬🇧 ☀️
          </p>
        </div>
      </div>
    </div>
  );
}