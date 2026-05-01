import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Sun, MapPin, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import LocationInput from "../components/LocationInput";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const medalBg = ["bg-yellow-50 border-yellow-200", "bg-slate-50 border-slate-200", "bg-amber-50 border-amber-200"];

const sunStatusLabel = { full_sun: "Full Sun", partial_sun: "Partial Sun", shade: "Shade" };
const sunStatusColor = { full_sun: "text-primary", partial_sun: "text-amber-500", shade: "text-muted-foreground" };

export default function Leaderboard() {
  const [pubs, setPubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationName, setLocationName] = useState("");
  const { pulling, distance } = usePullToRefresh(() => { setPubs([]); setHasSearched(false); }, hasSearched && !isLoading);

  const handleSearch = async ({ lat, lng, text }) => {
    setIsLoading(true);
    setHasSearched(true);
    setPubs([]);

    const locationStr = text || `latitude ${lat}, longitude ${lng}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a local pub expert. Find the TOP 10 sunniest and best-rated pub gardens near: ${locationStr}

Rank them by a combination of: south/south-west facing orientation, open exposure to sunlight, garden quality, and overall pub rating.

Return the top 10 real pubs in this area, ranked from best to worst for sunny garden experiences. Be as accurate as possible with real pub names, addresses, and ratings.

For image_url, use one of these real Unsplash pub/beer garden photo URLs — pick the one that best matches the pub's vibe:
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
          location_name: { type: "string" },
          pubs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                description: { type: "string", description: "Why this garden is great for sunshine, 1-2 sentences" },
                sun_status: { type: "string", enum: ["full_sun", "partial_sun", "shade"] },
                rating: { type: "number", description: "Out of 5" },
                sun_score: { type: "number", description: "Sunshine score out of 10" },
                image_url: { type: "string" },
                google_maps_url: { type: "string" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    setPubs(result.pubs || []);
    setLocationName(result.location_name || locationStr);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" className="flex items-center justify-center text-xs text-muted-foreground transition-all font-sans" style={{ height: distance, overflow: "hidden" }}>
        {distance > 0 && (pulling ? "↑ Release to refresh" : "↓ Pull to refresh")}
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sun Score Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-2">The top sunniest pub gardens near you, ranked.</p>
        </div>

        <div className="mb-8">
          <LocationInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Ranking the sunniest spots…</p>
          </div>
        )}

        <AnimatePresence>
          {!isLoading && pubs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 text-center">{locationName}</h2>
              <div className="space-y-3">
                {pubs.map((pub, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex gap-4 items-center rounded-xl border p-4 ${i < 3 ? medalBg[i] : "bg-card border-border/60"}`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {i < 3 ? (
                        <Trophy className={`w-6 h-6 mx-auto ${medalColors[i]}`} />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                      )}
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                      <img src={pub.image_url} alt={pub.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{pub.name}</h3>
                        <div className="flex-shrink-0 flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                          <Sun className="w-3 h-3" />
                          {pub.sun_score}/10
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />{pub.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-xs font-medium ${sunStatusColor[pub.sun_status]}`}>
                          {sunStatusLabel[pub.sun_status]}
                        </span>
                        {pub.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-primary text-primary" />{pub.rating}
                          </span>
                        )}
                        {pub.google_maps_url && (
                          <a href={pub.google_maps_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-accent transition-colors ml-auto">
                            Directions →
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && hasSearched && pubs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No results found. Try a different location.</div>
        )}
      </div>
    </div>
  );
}