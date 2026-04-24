import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import SunBadge from "./SunBadge";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

export default function PubMap({ pubs, center }) {
  if (!center || !pubs?.length) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
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
      </MapContainer>
    </div>
  );
}