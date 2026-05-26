import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useFavourites } from "../hooks/useFavourites";
import { useWeather } from "../hooks/useWeather";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import HeroSection from "../components/HeroSection";
import LocationInput from "../components/LocationInput";
import TimeSlider from "../components/TimeSlider";
import PubCard from "../components/PubCard";
import PubMap from "../components/PubMap";
import LoadingState from "../components/LoadingState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Map, Sun, CloudSun, Cloud, Heart, LogOut } from "lucide-react";
import OnboardingModal from "../components/OnboardingModal";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [pubs, setPubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState("grid");
  const [mapCenter, setMapCenter] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null); // null = use current time
  const [selectedDate, setSelectedDate] = useState(null); // null = use today
  const { favourites, isFavourite, toggleFavourite: _toggleFavourite } = useFavourites();
  const [favouriteAnnouncement, setFavouriteAnnouncement] = useState("");

  const toggleFavourite = (pub) => {
    _toggleFavourite(pub);
    setFavouriteAnnouncement(isFavourite(pub) ? `Removed ${pub.name} from My Sunny Spots` : `Saved ${pub.name} to My Sunny Spots`);
    setTimeout(() => setFavouriteAnnouncement(""), 2000);
  };
  const { getWeather, isLoadingWeather } = useWeather(pubs);

  const handlePullRefresh = useCallback(() => {
    if (hasSearched && !isLoading) {
      setPubs([]);
      setHasSearched(false);
    }
  }, [hasSearched, isLoading]);

  const { pulling, distance, threshold } = usePullToRefresh(handlePullRefresh, hasSearched && !isLoading);

  const handleSearch = async ({ lat, lng, text }) => {
    setIsLoading(true);
    setHasSearched(true);
    setPubs([]);

    const now = new Date();
    const hour = selectedHour !== null ? selectedHour : now.getHours();
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const targetDate = selectedDate ? new Date(selectedDate) : now;
    const dateStr = targetDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const locationStr = text || `latitude ${lat}, longitude ${lng}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a local pub expert. The current date is ${dateStr} and the time is ${timeStr}.

Find pub gardens that are likely to be in sunshine RIGHT NOW near: ${locationStr}

For each pub, consider:
- The direction the garden faces (south/south-west facing get most sun in the UK/northern hemisphere)
- The time of day and typical sun position
- Whether the garden is open/exposed vs surrounded by tall buildings or trees
- Current season and typical weather

Return 6-10 real pubs with gardens in this area. Be as accurate and real as possible - use actual pub names and addresses.

For sun_status use:
- "full_sun" if the garden is very likely in direct sunshine now
- "partial_sun" if the garden gets some sun but may have partial shade
- "shade" if the garden is mostly shaded at this time

For image_url, use one of these real Unsplash pub/beer garden photo URLs — pick the one that best matches the pub's vibe (busy city pub, cosy countryside, riverside, rooftop, etc.):
- https://images.unsplash.com/photo-1555658636-6e4a36218be7?w=600 (sunny beer garden, wooden tables)
- https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600 (outdoor pub terrace, sunny day)
- https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600 (traditional English pub exterior)
- https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600 (pub garden with flowers)
- https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=600 (riverside pub, summer)
- https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600 (busy beer garden, umbrellas)
- https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600 (cosy countryside pub)
- https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600 (outdoor dining, warm light)
Always pick a different URL for each pub.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          location_name: { type: "string", description: "Friendly name of the area searched" },
          weather_summary: { type: "string", description: "Brief current weather/sun conditions" },
          pubs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string", description: "2 sentences about the pub garden and why it's good for sunshine" },
                address: { type: "string" },
                sun_status: { type: "string", enum: ["full_sun", "partial_sun", "shade"] },
                sun_hours: { type: "string", description: "e.g. 'Until ~6:30pm' or '2pm - 5pm'" },
                rating: { type: "number", description: "Out of 5" },
                lat: { type: "number" },
                lng: { type: "number" },
                google_maps_url: { type: "string" },
                image_url: { type: "string" },
                dog_friendly: { type: "boolean", description: "Is the pub dog friendly?" },
                wheelchair_accessible: { type: "boolean", description: "Is the pub wheelchair accessible?" },
                dietary_options: { type: "array", items: { type: "string", enum: ["vegan", "vegetarian", "gluten-free", "halal"] }, description: "Dietary options available" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    setPubs(result.pubs || []);
    setSearchInfo({ location: result.location_name, weather: result.weather_summary });

    if (result.pubs?.length > 0) {
      const firstWithCoords = result.pubs.find(p => p.lat && p.lng);
      if (firstWithCoords) {
        setMapCenter([firstWithCoords.lat, firstWithCoords.lng]);
      }
    } else if (lat && lng) {
      setMapCenter([lat, lng]);
    }

    setIsLoading(false);
  };

  const filteredPubs = filter === "all" ? pubs : pubs.filter(p => p.sun_status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Screen-reader announcements for optimistic updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{favouriteAnnouncement}</div>
      <OnboardingModal />
      {/* Pull-to-refresh indicator */}
      <div
        role="status"
        aria-live="polite"
        aria-label={distance > 0 ? (pulling ? "Release to refresh" : "Pull to refresh") : undefined}
        className="flex items-center justify-center text-xs text-muted-foreground transition-all"
        style={{ height: distance, overflow: "hidden" }}
      >
        {distance > 0 && (pulling ? "↑ Release to refresh" : "↓ Pull to refresh")}
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <HeroSection />

        <div className="pb-8">
          <LocationInput onSearch={handleSearch} isLoading={isLoading} />
          <TimeSlider value={selectedHour} onChange={setSelectedHour} date={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {isLoading && <LoadingState onCancel={() => { setIsLoading(false); setHasSearched(false); }} />}

        <AnimatePresence>
          {!isLoading && hasSearched && pubs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Search info */}
              {searchInfo && (
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {searchInfo.location}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{searchInfo.weather}</p>
                  {favourites.length > 0 && (
                    <Link to="/my-sunny-spots" className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-primary hover:text-accent transition-colors">
                      <Heart className="w-3.5 h-3.5 fill-primary" />
                      View My Sunny Spots ({favourites.length})
                    </Link>
                  )}
                </div>
              )}

              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div role="radiogroup" aria-label="Sun filter" className="flex items-center gap-2">
                  <button
                    role="radio"
                    aria-checked={filter === "all"}
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    All ({pubs.length})
                  </button>
                  <button
                    role="radio"
                    aria-checked={filter === "full_sun"}
                    onClick={() => setFilter("full_sun")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${filter === "full_sun" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <Sun className="w-3 h-3" aria-hidden="true" /> Full Sun
                  </button>
                  <button
                    role="radio"
                    aria-checked={filter === "partial_sun"}
                    onClick={() => setFilter("partial_sun")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${filter === "partial_sun" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <CloudSun className="w-3 h-3" aria-hidden="true" /> Partial
                  </button>
                  <button
                    role="radio"
                    aria-checked={filter === "shade"}
                    onClick={() => setFilter("shade")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${filter === "shade" ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <Cloud className="w-3 h-3" aria-hidden="true" /> Shade
                  </button>
                </div>

                <div role="radiogroup" aria-label="View mode" className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    role="radio"
                    aria-checked={view === "grid"}
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-md transition-colors ${view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    role="radio"
                    aria-checked={view === "map"}
                    aria-label="Map view"
                    onClick={() => setView("map")}
                    className={`p-2 rounded-md transition-colors ${view === "map" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    <Map className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
                  {filteredPubs.map((pub, i) => (
                    <PubCard key={i} pub={pub} index={i} isFavourite={isFavourite(pub)} onToggleFavourite={toggleFavourite} weather={getWeather(pub)} isLoadingWeather={isLoadingWeather} />
                  ))}
                  {filteredPubs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      No pubs match this filter.
                    </div>
                  )}
                </div>
              ) : (
                <div className="pb-16">
                  <PubMap pubs={filteredPubs} center={mapCenter} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {filteredPubs.map((pub, i) => (
                      <PubCard key={i} pub={pub} index={i} isFavourite={isFavourite(pub)} onToggleFavourite={toggleFavourite} weather={getWeather(pub)} isLoadingWeather={isLoadingWeather} />
                    ))}
                    </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && hasSearched && pubs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No pub gardens found for that area. Try a different location.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/40 space-y-4">
          <p className="text-xs text-muted-foreground">
            Sun positions are estimated based on time of day, season, and garden orientation. Always check ahead!
          </p>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit app
          </button>
        </div>
      </div>
    </div>
  );
}