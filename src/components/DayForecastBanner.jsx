import { Thermometer, Droplets, CloudRain, Sun, Cloud } from "lucide-react";

const WMO_DESCRIPTIONS = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Light showers", 81: "Showers", 82: "Heavy showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail",
};

export default function DayForecastBanner({ forecast, date }) {
  if (!forecast) return null;

  const label = date ? new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "Today";
  const description = WMO_DESCRIPTIONS[forecast.weather_code] || "";
  const rainColor = forecast.precipitation_probability >= 60 ? "text-blue-600" : forecast.precipitation_probability >= 30 ? "text-amber-600" : "text-green-600";
  const isSunny = forecast.weather_code <= 2;

  return (
    <div className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl px-5 py-3 mb-6 flex-wrap">
      <div className="flex items-center gap-2 mr-auto">
        {isSunny ? <Sun className="w-5 h-5 text-primary" /> : <Cloud className="w-5 h-5 text-muted-foreground" />}
        <div>
          <p className="text-xs text-muted-foreground leading-none">{label}</p>
          <p className="text-sm font-semibold text-foreground leading-snug">{description}</p>
        </div>
      </div>
      {forecast.high !== null && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Thermometer className="w-4 h-4 text-accent" />
          {forecast.low}–{forecast.high}°C
        </div>
      )}
      {forecast.precipitation_probability !== null && (
        <div className={`flex items-center gap-1.5 text-sm font-medium ${rainColor}`}>
          <Droplets className="w-4 h-4" />
          {forecast.precipitation_probability}% rain
        </div>
      )}
    </div>
  );
}