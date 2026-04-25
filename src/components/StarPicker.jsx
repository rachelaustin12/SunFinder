import { Star } from "lucide-react";

export default function StarPicker({ value, onChange, label }) {
  return (
    <div>
      {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${star <= value ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}