import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Sun } from "lucide-react";

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= value ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function ReviewList({ pub, optimisticReviews = [] }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Review.filter(
      { pub_name: pub.name, pub_address: pub.address },
      "-created_date",
      20
    ).then((r) => { setReviews(r); setLoading(false); });
  }, [pub.name, pub.address]);

  const allReviews = [...optimisticReviews, ...reviews];

  if (loading && optimisticReviews.length === 0) return <p className="text-xs text-muted-foreground py-2">Loading reviews...</p>;
  if (allReviews.length === 0) return <p className="text-xs text-muted-foreground py-2">No reviews yet. Be the first!</p>;

  return (
    <div className="space-y-4 mt-2">
      {allReviews.map((r) => (
        <div key={r.id} className={`border-t border-border/40 pt-3 space-y-1.5 ${r.pending ? "opacity-60" : ""}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              {r.reviewer_name}
              {r.pending && <span className="ml-1.5 text-muted-foreground font-normal">(posting…)</span>}
            </span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-3">
            <StarDisplay value={r.rating} />
            {r.sun_rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sun className="w-3 h-3 text-primary" />
                <span>{r.sun_rating}/5 sun</span>
              </div>
            )}
          </div>
          {r.comment && <p className="text-xs text-foreground/80 leading-relaxed">{r.comment}</p>}
          {r.photo_url && (
            <a href={r.photo_url} target="_blank" rel="noopener noreferrer">
              <img src={r.photo_url} alt="Review photo" className="mt-1.5 h-24 w-auto rounded-lg object-cover border border-border/40 hover:opacity-90 transition-opacity" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}