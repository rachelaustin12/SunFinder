import { Clock, X, Calendar } from "lucide-react";
import { useState } from "react";

function formatHour(hour) {
  if (hour === 0 || hour === 24) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr);
  const todayStr = today.toDateString();
  const tomorrowStr = new Date(today.getTime() + 86400000).toDateString();
  if (d.toDateString() === todayStr) return "Today";
  if (d.toDateString() === tomorrowStr) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function TimeSlider({ value, onChange, date, onDateChange }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleReset = () => {
    onChange(null);
    if (onDateChange) onDateChange(null);
  };

  const hasCustomDate = date && date !== todayStr;
  const isCustomised = value !== null || hasCustomDate;

  return (
    <div className="w-full max-w-2xl mx-auto mt-5 px-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Plan ahead</span>
        {isCustomised && (
          <button
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Reset to now
          </button>
        )}
      </div>

      {/* Date picker */}
      {onDateChange && (
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {/* Today + next 6 days */}
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const str = d.toISOString().split("T")[0];
              const selected = (date || todayStr) === str;
              return (
                <button
                  key={str}
                  onClick={() => onDateChange(i === 0 ? null : str)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    selected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hour picker */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
        {hours.map((hour) => (
          <button
            key={hour}
            onClick={() => onChange(hour)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              value === hour
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