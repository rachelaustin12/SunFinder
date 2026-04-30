import { MapPin, Trash2, Edit2, ChevronRight, Footprints, Navigation } from "lucide-react";
import TrailMap from "./TrailMap";
import { useState } from "react";

const buildGoogleMapsWalkingUrl = (stops) => {
  const validStops = (stops || []).filter(s => (s.lat && s.lng) || s.address || s.name);
  if (validStops.length < 2) return null;
  const encode = (s) => s.lat && s.lng ? `${s.lat},${s.lng}` : encodeURIComponent(s.address || s.name);
  const origin = encode(validStops[0]);
  const destination = encode(validStops[validStops.length - 1]);
  const waypoints = validStops.slice(1, -1).map(encode).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=walking`;
};

export default function SavedRouteCard({ route, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mapStops = (route.stops || []).filter(s => s.lat && s.lng);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Footprints className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{route.name}</p>
          {route.description && <p className="text-xs text-muted-foreground truncate">{route.description}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">{route.stops?.length || 0} stops</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-90" : ""}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-4">
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            {buildGoogleMapsWalkingUrl(route.stops) && (
              <a
                href={buildGoogleMapsWalkingUrl(route.stops)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Walk This Route
              </a>
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sure?</span>
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>

          {/* Map */}
          {mapStops.length >= 2 && (
            <div className="rounded-xl overflow-hidden border border-border/60">
              <TrailMap stops={mapStops} />
            </div>
          )}

          {/* Stop list */}
          <div className="space-y-2">
            {route.stops?.map((stop, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{stop.name}</p>
                  {stop.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{stop.address}
                    </p>
                  )}
                  {stop.notes && <p className="text-xs text-foreground/70 mt-0.5 italic">{stop.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}