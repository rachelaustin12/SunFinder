import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import SunBadge from "./SunBadge";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Loader2 } from "lucide-react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const sunIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const myLocationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  className: "hue-rotate-[200deg]", // blue tint for "my location"
});

// Inner component that has access to the map instance
function LocateMeControl({ onLocate }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        map.flyTo([lat, lng], 15, { duration: 1.2 });
        onLocate({ lat, lng });
        setLoading(false);
      },
      () => setLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "auto" }}>
      <div className="leaflet-control m-2">
        <button
          onClick={handleLocate}
          disabled={loading}
          title="Find my location"
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-primary" />}
          {loading ? "Locating…" : "My location"}
        </button>
      </div>
    </div>
  );
}

export default function PubMap({ pubs, center }) {
  const [myPos, setMyPos] = useState(null);

  if (!center || !pubs?.length) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm relative">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pubs.map((pub, i) => (
          pub.lat && pub.lng ? (
            <Marker key={i} position={[pub.lat, pub.lng]} icon={sunIcon}>
              <Popup>
                <div className="text-sm">
                  <strong>{pub.name}</strong>
                  <br />
                  <span className="text-muted-foreground">{pub.address}</span>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        {myPos && (
          <Marker position={[myPos.lat, myPos.lng]} icon={myLocationIcon}>
            <Popup><div className="text-sm font-medium">📍 You are here</div></Popup>
          </Marker>
        )}
        <LocateMeControl onLocate={setMyPos} />
      </MapContainer>
    </div>
  );
}