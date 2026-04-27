import { Clock, X } from "lucide-react";

function formatHour(hour) {
  if (hour === 0 || hour === 24) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

export default function TimeSlider({ value, onChange }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const currentHour = value ?? new Date().getHours();

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Select time</span>
        {value !== null && (
          <button
            onClick={() => onChange(null)}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Reset to now
          </button>
        )}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
        {hours.map((hour) => (
          <button
            key={hour}
            onClick={() => onChange(hour)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              currentHour === hour
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {formatHour(hour)}
          </button>
        ))}
      </div>
    </div>
  );
}