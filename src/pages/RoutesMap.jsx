import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Footprints, MapPin, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Distinct colours for routes
const ROUTE_COLOURS = [
  "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6",
  "#f97316", "#06b6d4", "#ec4899", "#84cc16", "#6366f1",
];

const makeNumberedIcon = (num, colour) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${colour};
      color:#fff;
      width:28px;height:28px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

function FitBounds({ routes }) {
  const map = useMap();
  useEffect(() => {
    const coords = routes.flatMap(r =>
      (r.stops || []).filter(s => s.lat && s.lng).map(s => [s.lat, s.lng])
    );
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
    }
  }, [routes]);
  return null;
}

export default function RoutesMap() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    base44.entities.SavedRoute.list("-created_date").then(r => {
      setRoutes(r);
      setLoading(false);
    });
  }, []);

  const routesWithCoords = routes.filter(r =>
    (r.stops || []).some(s => s.lat && s.lng)
  );

  return (
    <div className="fixed inset-0 bg-background flex flex-col" style={{ top: 56, bottom: 64 }}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : routesWithCoords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Footprints className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground">No mapped routes yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Save routes with lat/lng coordinates on stops to see them here.
          </p>
        </div>
      ) : (
        <div className="flex-1 relative">
          {/* Map */}
          <MapContainer
            center={[51.5074, -0.1278]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FitBounds routes={routesWithCoords} />
            {routesWithCoords.map((route, ri) => {
              const colour = ROUTE_COLOURS[ri % ROUTE_COLOURS.length];
              const mapStops = (route.stops || []).filter(s => s.lat && s.lng);
              const isSelected = selectedRoute?.id === route.id;
              return (
                <div key={route.id}>
                  {/* Route polyline */}
                  <Polyline
                    positions={mapStops.map(s => [s.lat, s.lng])}
                    color={colour}
                    weight={isSelected ? 5 : 3}
                    opacity={isSelected ? 1 : 0.6}
                    dashArray={isSelected ? null : "6 4"}
                  />
                  {/* Stop markers */}
                  {mapStops.map((stop, si) => (
                    <Marker
                      key={si}
                      position={[stop.lat, stop.lng]}
                      icon={makeNumberedIcon(si + 1, colour)}
                      eventHandlers={{ click: () => setSelectedRoute(route) }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{stop.name}</p>
                          {stop.address && <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>}
                          <p className="text-xs mt-1" style={{ color: colour }}>
                            {route.name} — stop {si + 1}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </div>
              );
            })}
          </MapContainer>

          {/* Slide-up route panel */}
          <div className="absolute bottom-0 left-0 right-0 z-[1000]">
            {/* Toggle button */}
            <div className="flex justify-center mb-1">
              <button
                onClick={() => setPanelOpen(o => !o)}
                className="bg-card border border-border/60 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground shadow flex items-center gap-1.5"
              >
                {panelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                {routesWithCoords.length} route{routesWithCoords.length !== 1 ? "s" : ""}
              </button>
            </div>

            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 260 }}
                  className="bg-card border-t border-border/60 rounded-t-2xl shadow-xl max-h-56 overflow-y-auto"
                >
                  <div className="px-4 py-3 space-y-2">
                    {routesWithCoords.map((route, ri) => {
                      const colour = ROUTE_COLOURS[ri % ROUTE_COLOURS.length];
                      const isSelected = selectedRoute?.id === route.id;
                      return (
                        <button
                          key={route.id}
                          onClick={() => setSelectedRoute(isSelected ? null : route)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            isSelected ? "bg-muted" : "hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: colour }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{route.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {route.stops?.filter(s => s.lat && s.lng).length} mapped stop{route.stops?.filter(s => s.lat && s.lng).length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {isSelected && <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}