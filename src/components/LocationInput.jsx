import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export default function LocationInput({ onSearch, isLoading }) {
  const [location, setLocation] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        onSearch({ lat: latitude, lng: longitude, text: null });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      onSearch({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]), text: null });
    } else {
      onSearch({ lat: null, lng: null, text: location.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl mx-auto">
      {/* Input with geo icon inside */}
      <div className="relative flex-1">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full h-14 rounded-full bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm pl-10" />
        
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
          aria-label="Use my location">
          
          {geoLoading ?
          <Loader2 className="w-4 h-4 animate-spin" /> :

          <Navigation className="w-4 h-4" />
          }
          <span className="text-[10px] font-medium leading-tight">Locate me</span>
        </button>
      </div>

      {/* Find Sunshine pill button */}
      <button
        type="submit"
        disabled={isLoading || !location.trim()}
        className="h-14 px-6 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2">
        
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        Find Sunshine
      </button>
    </form>);

}