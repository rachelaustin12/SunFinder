import { Heart, Trash2, Sun, Camera, Loader2 } from "lucide-react";
import { useFavourites } from "../hooks/useFavourites";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import PubCard from "../components/PubCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

function PhotoUploadButton({ pub, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploaded(pub, file_url);
    setUploading(false);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/60 transition-colors disabled:opacity-60"
        title="Add your own photo"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        {uploading ? "Uploading…" : "Add photo"}
      </button>
    </>
  );
}

export default function MySunnySpots() {
  const { favourites, removeFavourite, updateFavourite, clearAllFavourites } = useFavourites();
  const { pulling, distance } = usePullToRefresh(() => {}, true);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllFavourites();
    setConfirmClear(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" className="flex items-center justify-center text-xs text-muted-foreground transition-all font-sans" style={{ height: distance, overflow: "hidden" }}>
        {distance > 0 && (pulling ? "↑ Release to refresh" : "↓ Pull to refresh")}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              My Sunny Spots
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {favourites.length === 0
                ? "No saved spots yet"
                : `${favourites.length} pub garden${favourites.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {favourites.length > 0 && (
            <div className="flex-shrink-0 pt-1">
              {!confirmClear ? (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs" onClick={handleClearAll}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear all
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive font-medium">Sure?</span>
                  <Button variant="destructive" size="sm" className="text-xs h-7 px-3" onClick={handleClearAll}>Yes, clear</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-3" onClick={() => setConfirmClear(false)}>Cancel</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {favourites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 flex flex-col items-center gap-4"
          >
            <Sun className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground text-lg font-medium">No sunny spots saved yet</p>
            <p className="text-muted-foreground text-sm">
              Search for pub gardens and tap the ♥ to save your favourites.
            </p>
            <Link to="/">
              <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Find Sunny Pubs
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
            {favourites.map((pub, i) => (
              <div key={`${pub.name}-${pub.address}`} className="relative">
                <PubCard pub={pub} index={i} />
                {/* Remove button */}
                <button
                  onClick={() => removeFavourite(pub)}
                  className="absolute top-3 left-3 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
                  title="Remove from My Sunny Spots"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {/* Photo upload */}
                <PhotoUploadButton pub={pub} onUploaded={(p, url) => updateFavourite(p, { user_photo_url: url })} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}