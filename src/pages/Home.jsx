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
    const targetDate = selectedDate ? new Date(selectedDate) : now;
    const dateStr = targetDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const locationStr = text || (lat && lng ? `${lat}, ${lng}` : null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `UK pub sun expert. Date: ${dateStr}, Time: ${timeStr}. Location: "${locationStr}".

List 6 real pubs with outdoor beer gardens near this location. For each return:
name, address, rating (3.5-5.0), lat, lng, google_maps_url (https://www.google.com/maps/search/?api=1&query=URLENCODED_NAME_ADDRESS), sun_status ("full_sun"/"partial_sun"/"shade" at ${timeStr}), sun_hours (e.g. "Until 6pm"), description (1 sentence), dog_friendly, wheelchair_accessible, dietary_options (array of "vegan"/"vegetarian"/"gluten-free"/"halal"), image_url (null).

Also: location_name (short area name), weather_summary (one sentence).

Only include pubs with genuine outdoor seating. Be concise.`,
      response_json_schema: {
        type: "object",
        properties: {
          location_name: { type: "string" },
          weather_summary: { type: "string" },
          pubs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                rating: { type: "number" },
                lat: { type: "number" },
                lng: { type: "number" },
                google_maps_url: { type: "string" },
                sun_status: { type: "string", enum: ["full_sun", "partial_sun", "shade"] },
                sun_hours: { type: "string" },
                description: { type: "string" },
                dog_friendly: { type: "boolean" },
                wheelchair_accessible: { type: "boolean" },
                dietary_options: { type: "array", items: { type: "string" } },
                image_url: { type: "string" }
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
        <div className="text-center py-8 border-t border-border/40 space-y-3">
          <p className="text-xs text-muted-foreground">
            Sun positions are estimated based on time of day, season, and garden orientation. Always check ahead!
          </p>
          <p className="text-[10px] text-muted-foreground/50">Photos are illustrative and sourced from Google Maps.</p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <button
              onClick={() => window.close()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Exit App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}