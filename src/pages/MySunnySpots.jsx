import { Heart, Trash2, Sun } from "lucide-react";
import { useFavourites } from "../hooks/useFavourites";
import PubCard from "../components/PubCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function MySunnySpots() {
  const { favourites, removeFavourite } = useFavourites();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
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
          <Link to="/">
            <Button variant="outline">← Back to search</Button>
          </Link>
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
                <button
                  onClick={() => removeFavourite(pub)}
                  className="absolute top-3 left-3 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
                  title="Remove from My Sunny Spots"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}