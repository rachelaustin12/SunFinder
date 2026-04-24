import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    // Check if it's coordinates
    const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      onSearch({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]), text: null });
    } else {
      onSearch({ lat: null, lng: null, text: location.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
      <div className="relative flex-1">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your area, city or postcode..."
          className="pl-10 h-12 bg-card border-border/60 text-base"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 border-border/60"
          onClick={handleGeolocate}
          disabled={geoLoading || isLoading}
        >
          {geoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
        <Button
          type="submit"
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          disabled={isLoading || !location.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Find Sunshine
        </Button>
      </div>
    </form>
  );
}