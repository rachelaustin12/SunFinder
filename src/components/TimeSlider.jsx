import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";

function formatHour(hour) {
  if (hour === 0 || hour === 24) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

export default function TimeSlider({ value, onChange }) {
  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Time</span>
        </div>
        <span className="text-sm font-semibold text-primary">
          {value === null ? "Now" : formatHour(value)}
        </span>
      </div>
      <Slider
        min={6}
        max={23}
        step={1}
        value={[value ?? new Date().getHours()]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>6am</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-primary hover:text-accent font-medium transition-colors"
        >
          Use current time
        </button>
        <span>11pm</span>
      </div>
    </div>
  );
}