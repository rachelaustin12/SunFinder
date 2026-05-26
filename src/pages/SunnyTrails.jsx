import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Footprints, Sun, Clock, MapPin, Loader2, Plus, Sparkles, BookMarked, Navigation, BookmarkPlus, BookmarkCheck } from "lucide-react";
import LoadingState from "../components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import LocationInput from "../components/LocationInput";
import TrailMap from "../components/TrailMap";
import RouteBuilder from "../components/RouteBuilder";
import SavedRouteCard from "../components/SavedRouteCard";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

const buildGoogleMapsWalkingUrl = (stops) => {
  const validStops = stops.filter(s => s.lat && s.lng);
  if (validStops.length < 2) return null;
  const origin = `${validStops[0].lat},${validStops[0].lng}`;
  const destination = `${validStops[validStops.length - 1].lat},${validStops[validStops.length - 1].lng}`;
  const waypoints = validStops.slice(1, -1).map(s => `${s.lat},${s.lng}`).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=walking`;
};

const difficultyColor = {
  easy: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  leisurely: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function SunnyTrails() {
  const [tab, setTab] = useState("ai"); // "ai" | "my"
  // AI trails state
  const [trails, setTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [savedTrailNames, setSavedTrailNames] = useState(new Set());
  const [savingTrailName, setSavingTrailName] = useState(null); // track which trail is saving
  const [justSaved, setJustSaved] = useState(null); // trail name that was just saved (for prompt)
  // My routes state
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [building, setBuilding] = useState(false); // creating new
  const [editingRoute, setEditingRoute] = useState(null); // route object
  const [routeIsDirty, setRouteIsDirty] = useState(false);
  const { pulling, distance } = usePullToRefresh(() => { setTrails([]); setHasSearched(false); setSelectedTrail(null); }, hasSearched && !isLoading && tab === "ai");

  useEffect(() => {
    if (tab === "my") loadRoutes();
  }, [tab]);

  // On mount, load saved route names so Save button reflects reality after navigation
  useEffect(() => {
    base44.entities.SavedRoute.list("-created_date").then(routes => {
      setSavedTrailNames(new Set(routes.map(r => r.name)));
      setSavedRoutes(routes);
    });
  }, []);

  const loadRoutes = async () => {
    setLoadingRoutes(true);
    const routes = await base44.entities.SavedRoute.list("-created_date");
    setSavedRoutes(routes);
    setSavedTrailNames(new Set(routes.map(r => r.name)));
    setLoadingRoutes(false);
  };

  const handleSaveTrail = async (trail) => {
    setSavingTrailName(trail.name);
    await base44.entities.SavedRoute.create({
      name: trail.name,
      description: trail.tagline,
      stops: (trail.stops || []).map(s => ({
        name: s.name,
        address: s.address,
        notes: s.sun_highlight || "",
        lat: s.lat || null,
        lng: s.lng || null,
      })),
    });
    setSavedTrailNames(prev => new Set([...prev, trail.name]));
    setSavingTrailName(null);
    setJustSaved(trail.name);
    setTimeout(() => setJustSaved(null), 4000);
  };

  const handleDelete = async (route) => {
    await base44.entities.SavedRoute.delete(route.id);
    setSavedRoutes(savedRoutes.filter(r => r.id !== route.id));
  };

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

Use real pub names and accurate addresses. For image_url, use one of these real Unsplash pub/beer garden photo URLs — pick the one that best matches the trail's vibe:
- https://images.unsplash.com/photo-1555658636-6e4a36218be7?w=800 (sunny beer garden, wooden tables)
- https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800 (outdoor pub terrace, sunny day)
- https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800 (traditional English pub exterior)
- https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800 (pub garden with flowers)
- https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800 (riverside pub, summer)
- https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800 (busy beer garden, umbrellas)
- https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800 (cosy countryside pub)
Always pick a different URL for each trail.`,
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
                best_time: { type: "string" },
                image_url: { type: "string" },
                stops: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      order: { type: "number" },
                      name: { type: "string" },
                      address: { type: "string" },
                      description: { type: "string" },
                      sun_highlight: { type: "string" },
                      walk_from_previous_mins: { type: "number" },
                      suggested_time_mins: { type: "number" },
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
      <div role="status" aria-live="polite" className="flex items-center justify-center text-xs text-muted-foreground transition-all font-sans" style={{ height: distance, overflow: "hidden" }}>
        {distance > 0 && (pulling ? "↑ Release to refresh" : "↓ Pull to refresh")}
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Footprints className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sunny Strolls</h1>
          <p className="text-muted-foreground text-sm mt-2">AI-generated pub crawl routes — or build your own.</p>
        </div>

        {/* Tab switcher */}
        <div role="tablist" aria-label="Route tabs" className="flex bg-muted rounded-xl p-1 mb-8">
          <button
            role="tab"
            aria-selected={tab === "ai"}
            onClick={() => {
              if ((building || editingRoute) && routeIsDirty && !window.confirm("Leave route planner? Your unsaved changes will be lost.")) return;
              setBuilding(false); setEditingRoute(null); setRouteIsDirty(false); setTab("ai");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "ai" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" /> AI Routes
          </button>
          <button
            role="tab"
            aria-selected={tab === "my"}
            onClick={() => {
              if ((building || editingRoute) && routeIsDirty && !window.confirm("Leave route planner? Your unsaved changes will be lost.")) return;
              setBuilding(false); setEditingRoute(null); setRouteIsDirty(false); setTab("my");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "my" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BookMarked className="w-4 h-4" aria-hidden="true" /> My Routes
          </button>
        </div>

        {/* ── AI TAB ── */}
        {tab === "ai" && (
          <div>
            <div className="mb-8">
              <LocationInput onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {isLoading && (
              <LoadingState message="Plotting your sunny trail…" subMessage="Finding the best pub crawl routes near you" />
            )}

            <AnimatePresence>
              {!isLoading && trails.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-1 text-center">{locationName}</h2>
                  <p className="text-xs text-center text-muted-foreground mb-6">Choose a trail to explore</p>

                  <div role="radiogroup" aria-label="Select trail" className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
                    {trails.map((trail, i) => (
                      <button
                        key={i}
                        role="radio"
                        aria-checked={selectedTrail?.name === trail.name}
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

                  <AnimatePresence mode="wait">
                    {selectedTrail && (
                      <motion.div
                        key={selectedTrail.name}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="relative rounded-2xl overflow-hidden mb-6 h-48">
                          <img src={selectedTrail.image_url} alt={selectedTrail.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="font-display text-2xl font-bold text-white">{selectedTrail.name}</h3>
                            <p className="text-white/80 text-sm">{selectedTrail.tagline}</p>
                          </div>
                        </div>

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

                        <div className="flex items-center justify-between gap-2 mb-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${difficultyColor[selectedTrail.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                              {selectedTrail.difficulty}
                            </span>
                            <span className="text-xs text-muted-foreground">{selectedTrail.stops?.length} stops</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {buildGoogleMapsWalkingUrl(selectedTrail.stops || []) && (
                              <a
                                href={buildGoogleMapsWalkingUrl(selectedTrail.stops || [])}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                              >
                                <Navigation className="w-3.5 h-3.5" /> Walk This Route
                              </a>
                            )}
                            {savedTrailNames.has(selectedTrail.name) ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium">
                                <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> Saved
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSaveTrail(selectedTrail)}
                                disabled={savingTrailName === selectedTrail.name}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-60"
                              >
                                {savingTrailName === selectedTrail.name ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                                Save Route
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {justSaved === selectedTrail.name && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="flex items-center justify-between gap-3 mb-6 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm"
                            >
                              <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
                                <BookmarkCheck className="w-4 h-4" /> Route saved!
                              </span>
                              <button
                                onClick={() => { setJustSaved(null); setTab("my"); }}
                                className="text-xs text-green-700 dark:text-green-400 underline underline-offset-2 hover:no-underline"
                              >
                                View in My Routes →
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {selectedTrail.stops?.some(s => s.lat && s.lng) && (
                          <div className="mb-6 rounded-2xl overflow-hidden border border-border/60">
                            <TrailMap stops={selectedTrail.stops} />
                          </div>
                        )}

                        <div className="space-y-1">
                          {selectedTrail.stops?.map((stop, i) => (
                            <div key={i}>
                              <div className="flex gap-4 items-start p-4 bg-card border border-border/60 rounded-xl">
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
                              {i < selectedTrail.stops.length - 1 && (
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
        )}

        {/* ── MY ROUTES TAB ── */}
        {tab === "my" && (
          <div>
            {/* Builder view */}
            {(building || editingRoute) ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  {editingRoute ? "Edit Route" : "New Route"}
                </h2>
                <RouteBuilder
                  route={editingRoute}
                  onSaved={() => { setBuilding(false); setEditingRoute(null); setRouteIsDirty(false); loadRoutes(); }}
                  onCancel={() => { setBuilding(false); setEditingRoute(null); setRouteIsDirty(false); }}
                  onDirtyChange={setRouteIsDirty}
                />
              </motion.div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {savedRoutes.length === 0 ? "No routes saved yet" : `${savedRoutes.length} route${savedRoutes.length !== 1 ? "s" : ""} saved`}
                  </p>
                  <button
                    onClick={() => setBuilding(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New Route
                  </button>
                </div>

                {loadingRoutes ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : savedRoutes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <Footprints className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">No saved routes yet</p>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Save an AI-generated trail or build your own custom route with your favourite spots.
                    </p>
                    <button
                      onClick={() => setBuilding(true)}
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create Your First Route
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {savedRoutes.map(route => (
                      <SavedRouteCard
                        key={route.id}
                        route={route}
                        onEdit={() => setEditingRoute(route)}
                        onDelete={() => handleDelete(route)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}