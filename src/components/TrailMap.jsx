import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeNumberedIcon(number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:hsl(36,95%,52%);
      color:white;font-weight:700;font-size:13px;
      display:flex;align-items:center;justify-content:center;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function TrailMap({ stops }) {
  const validStops = (stops || []).filter(s => s.lat && s.lng);
  if (validStops.length === 0) return null;

  const positions = validStops.map(s => [s.lat, s.lng]);
  const center = positions[0];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
      {/* Route line */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "hsl(36,95%,52%)", weight: 3, opacity: 0.8, dashArray: "8 6" }}
      />
      {/* Numbered markers */}
      {validStops.map((stop, i) => (
        <Marker key={i} position={[stop.lat, stop.lng]} icon={makeNumberedIcon(i + 1)}>
          <Popup>
            <div className="text-sm">
              <strong>{stop.name}</strong>
              <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
              {stop.sun_highlight && <p className="text-xs text-orange-500 mt-1">☀️ {stop.sun_highlight}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}