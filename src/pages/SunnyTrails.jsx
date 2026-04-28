import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Footprints, Sun, Clock, MapPin, Beer, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocationInput from "../components/LocationInput";
import TrailMap from "../components/TrailMap";

const difficultyColor = {
  easy: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  leisurely: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function SunnyTrails() {
  const [trails, setTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [locationName, setLocationName] = useState("");

  const handleSearch = async ({ lat, lng, text }) => {
    setIsLoading(true);
    setHasSearched(true);
    setTrails([]);
    setSelectedTrail(null);

    const now = new Date();
    const hour = now.getHours();
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const locationStr = text || `latitude ${lat}, longitude ${lng}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a sunny pub trail expert. The current time is ${timeStr}.

Generate 3 different "Sunny Trail" pub crawl routes near: ${locationStr}

Each trail links 3-4 real nearby pub gardens that are likely to be sunny at different times of day, creating a logical walking route. Consider:
- The walking distance and order (start closest, end furthest or most scenic)
- Sun position throughout the day (which gardens catch afternoon sun vs evening sun)
- Historical popularity and quality of each pub
- Total walking time between pubs (realistic estimates)

For each trail:
- Give it a creative name (e.g. "The Golden Hour Trail", "The Southside Stroll")
- Include a short tagline
- List 3-4 pubs in walking order with approximate walk time between each
- Estimate total trail duration including time at each pub (e.g. "2.5 hours")
- Rate difficulty: "easy", "moderate", or "leisurely"

Use real pub names and accurate addresses. For image_url use Unsplash beer garden photos like https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          location_name: { type: "string" },
          trails: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                tagline: { type: "string" },
                total_duration: { type: "string" },
                total_distance_km: { type: "number" },
                difficulty: { type: "string", enum: ["easy", "moderate", "leisurely"] },
                best_time: { type: "string", description: "e.g. 'Best started at 2pm'" },
                image_url: { type: "string" },
                stops: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      order: { type: "number" },
                      name: { type: "string" },
                      address: { type: "string" },
                      description: { type: "string", description: "Why this stop is great, 1 sentence" },
                      sun_highlight: { type: "string", description: "e.g. 'South-facing terrace catches afternoon sun'" },
                      walk_from_previous_mins: { type: "number", description: "Walking minutes from previous stop (0 for first)" },
                      suggested_time_mins: { type: "number", description: "Suggested time to spend here in minutes" },
                      lat: { type: "number" },
                      lng: { type: "number" },
                      google_maps_url: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    setTrails(result.trails || []);
    setLocationName(result.location_name || locationStr);
    if (result.trails?.length > 0) setSelectedTrail(result.trails[0]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Footprints className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sunny Strolls</h1>
          <p className="text-muted-foreground text-sm mt-2">AI-generated pub crawl routes that follow the sun.</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <LocationInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Plotting your sunny trail…</p>
          </div>
        )}

        <AnimatePresence>
          {!isLoading && trails.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-1 text-center">{locationName}</h2>
              <p className="text-xs text-center text-muted-foreground mb-6">Choose a trail to explore</p>

              {/* Trail selector tabs */}
              <div className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
                {trails.map((trail, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTrail(trail)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      selectedTrail?.name === trail.name
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {trail.name}
                  </button>
                ))}
              </div>

              {/* Selected trail detail */}
              <AnimatePresence mode="wait">
                {selectedTrail && (
                  <motion.div
                    key={selectedTrail.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Trail hero */}
                    <div className="relative rounded-2xl overflow-hidden mb-6 h-48">
                      <img src={selectedTrail.image_url} alt={selectedTrail.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-display text-2xl font-bold text-white">{selectedTrail.name}</h3>
                        <p className="text-white/80 text-sm">{selectedTrail.tagline}</p>
                      </div>
                    </div>

                    {/* Trail stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
                        <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{selectedTrail.total_duration}</p>
                      </div>
                      <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
                        <Footprints className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="text-sm font-semibold text-foreground">{selectedTrail.total_distance_km?.toFixed(1)} km</p>
                      </div>
                      <div className="bg-card border border-border/60 rounded-xl p-3 text-center">
                        <Sun className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Best start</p>
                        <p className="text-sm font-semibold text-foreground">{selectedTrail.best_time}</p>
                      </div>
                    </div>

                    {/* Difficulty badge */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${difficultyColor[selectedTrail.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                        {selectedTrail.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedTrail.stops?.length} stops</span>
                    </div>

                    {/* Map */}
                    {selectedTrail.stops?.some(s => s.lat && s.lng) && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-border/60">
                        <TrailMap stops={selectedTrail.stops} />
                      </div>
                    )}

                    {/* Stop list */}
                    <div className="space-y-1">
                      {selectedTrail.stops?.map((stop, i) => (
                        <div key={i}>
                          <div className="flex gap-4 items-start p-4 bg-card border border-border/60 rounded-xl">
                            {/* Step number */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-foreground text-sm">{stop.name}</h4>
                                {stop.suggested_time_mins && (
                                  <span className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    ~{stop.suggested_time_mins}min
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />{stop.address}
                              </p>
                              <p className="text-xs text-foreground/80 mt-1">{stop.description}</p>
                              {stop.sun_highlight && (
                                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                  <Sun className="w-3 h-3 flex-shrink-0" />{stop.sun_highlight}
                                </p>
                              )}
                              {stop.google_maps_url && (
                                <a href={stop.google_maps_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors mt-2">
                                  <MapPin className="w-3 h-3" /> Directions
                                </a>
                              )}
                            </div>
                          </div>
                          {/* Walk connector */}
                          {i < selectedTrail.stops.length - 1 && stop.walk_from_previous_mins !== undefined && (
                            <div className="flex items-center gap-2 px-6 py-2">
                              <div className="w-0.5 h-4 bg-border mx-3.5" />
                              <span className="text-xs text-muted-foreground">
                                🚶 {selectedTrail.stops[i + 1]?.walk_from_previous_mins} min walk
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && hasSearched && trails.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No trails found. Try a different location.</div>
        )}
      </div>
    </div>
  );
}