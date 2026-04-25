import { MapPin, Clock, Star, ExternalLink, Heart, Dog, PersonStanding, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SunBadge from "./SunBadge";
import WeatherStrip from "./WeatherStrip";
import PubReviews from "./PubReviews";
import { motion } from "framer-motion";

export default function PubCard({ pub, index, isFavourite, onToggleFavourite, weather, isLoadingWeather }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <div className="relative h-44 overflow-hidden">
          <img
            src={pub.image_url}
            alt={pub.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3">
            <SunBadge status={pub.sun_status} />
          </div>
          {onToggleFavourite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavourite(pub); }}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all hover:scale-110"
              title={isFavourite ? "Remove from My Sunny Spots" : "Save to My Sunny Spots"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${isFavourite ? "fill-red-500 text-red-500" : "text-white"}`}
              />
            </button>
          )}
          {pub.rating && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-xs font-medium">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {pub.rating}
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-2">
            {pub.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {pub.description}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{pub.address}</span>
            </div>
            {pub.sun_hours && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Sun in garden: {pub.sun_hours}</span>
              </div>
            )}
          </div>
          <WeatherStrip weather={weather} isLoading={isLoadingWeather} />
          {/* Amenity badges */}
          {(pub.dog_friendly || pub.wheelchair_accessible || pub.dietary_options?.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pub.dog_friendly && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
                  <Dog className="w-3 h-3" /> Dogs welcome
                </span>
              )}
              {pub.wheelchair_accessible && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 font-medium">
                  <PersonStanding className="w-3 h-3" /> Wheelchair friendly
                </span>
              )}
              {pub.dietary_options?.map((opt) => (
                <span key={opt} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 font-medium capitalize">
                  <Leaf className="w-3 h-3" /> {opt}
                </span>
              ))}
            </div>
          )}

          {(pub.google_maps_url || (pub.lat && pub.lng)) && (
            <div className="mt-4 flex items-center gap-3">
              {pub.google_maps_url && (
                <a
                  href={pub.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Maps
                </a>
              )}
              {pub.lat && pub.lng && (
                <a
                  href={`https://waze.com/ul?ll=${pub.lat},${pub.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Waze
                </a>
              )}
            </div>
          )}
          <PubReviews pub={pub} />
        </CardContent>
      </Card>
    </motion.div>
  );
}