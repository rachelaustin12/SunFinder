import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import StarPicker from "./StarPicker";
import { ImagePlus, Loader2, X } from "lucide-react";

export default function ReviewForm({ pub, onOptimistic, onSubmitted, onCancel }) {
  const [rating, setRating] = useState(0);
  const [sunRating, setSunRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSaving(true);

    const optimistic = {
      id: `optimistic-${Date.now()}`,
      pub_name: pub.name,
      pub_address: pub.address,
      rating,
      sun_rating: sunRating || null,
      comment: comment.trim() || null,
      reviewer_name: reviewerName.trim() || "Anonymous",
      photo_url: photoPreview,
      created_date: new Date().toISOString(),
      pending: true,
    };
    onOptimistic?.(optimistic);

    let photo_url = null;
    if (photoFile) {
      const res = await base44.integrations.Core.UploadFile({ file: photoFile });
      photo_url = res.file_url;
    }

    await base44.entities.Review.create({
      pub_name: pub.name,
      pub_address: pub.address,
      rating,
      sun_rating: sunRating || null,
      comment: comment.trim() || null,
      reviewer_name: reviewerName.trim() || "Anonymous",
      photo_url,
    });

    setIsSaving(false);
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-card rounded-xl border border-border/60">
      <h3 className="font-display font-semibold text-base text-foreground">Leave a review</h3>

      <div className="grid grid-cols-2 gap-4">
        <StarPicker value={rating} onChange={setRating} label="Overall rating *" />
        <StarPicker value={sunRating} onChange={setSunRating} label="Sunshine ☀️" />
      </div>

      <Input
        placeholder="Your name (optional)"
        value={reviewerName}
        onChange={(e) => setReviewerName(e.target.value)}
        className="h-10"
      />

      <Textarea
        placeholder="Tell others about the garden and sun conditions..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="h-24 resize-none"
      />

      {/* Photo upload */}
      <div>
        {photoPreview ? (
          <div className="relative inline-block">
            <img src={photoPreview} alt="Preview" className="h-28 w-auto rounded-lg object-cover border border-border/60" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/60 rounded-lg px-4 py-2.5">
            <ImagePlus className="w-4 h-4" />
            Add a photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={rating === 0 || isSaving} className="bg-primary hover:bg-primary/90">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
          Submit review
        </Button>
      </div>
    </form>
  );
}