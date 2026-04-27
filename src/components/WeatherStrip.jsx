import { Thermometer, Droplets, Sun } from "lucide-react";

export default function WeatherStrip({ weather, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!weather || weather.temp === null) return null;

  const rainLevel =
    weather.precipitation_probability >= 70 ? "text-blue-500" :
    weather.precipitation_probability >= 40 ? "text-yellow-600" :
    "text-green-600";

  const uvColor =
    weather.uv_index >= 8 ? "text-red-600" :
    weather.uv_index >= 6 ? "text-orange-500" :
    weather.uv_index >= 3 ? "text-yellow-600" :
    "text-green-600";

  return (
    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Thermometer className="w-3.5 h-3.5 text-accent" />
        {weather.temp}°C
      </div>
      {weather.precipitation_probability !== null && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${rainLevel}`}>
          <Droplets className="w-3.5 h-3.5" />
          {weather.precipitation_probability}% rain
        </div>
      )}
      {weather.uv_index !== null && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${uvColor}`}>
          <Sun className="w-3.5 h-3.5" />
          UV {Math.round(weather.uv_index)}
        </div>
      )}
    </div>
  );
}