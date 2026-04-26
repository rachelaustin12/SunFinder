import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function PubReviews({ pub }) {
  const [showForm, setShowForm] = useState(false);
  const [optimisticReviews, setOptimisticReviews] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOptimistic = (review) => {
    setOptimisticReviews((prev) => [review, ...prev]);
  };

  const handleSubmitted = () => {
    setShowForm(false);
    setOptimisticReviews([]);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          Reviews
        </div>
        {!showForm && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
            + Add review
          </Button>
        )}
      </div>

      {showForm && (
        <ReviewForm
          pub={pub}
          onOptimistic={handleOptimistic}
          onSubmitted={handleSubmitted}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ReviewList key={refreshKey} pub={pub} optimisticReviews={optimisticReviews} />
    </div>
  );
}