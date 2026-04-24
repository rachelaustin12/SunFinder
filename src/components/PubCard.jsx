import { MapPin, Clock, Star, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SunBadge from "./SunBadge";
import { motion } from "framer-motion";

export default function PubCard({ pub, index }) {
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
          {pub.google_maps_url && (
            <a
              href={pub.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent transition-colors"
            >
              Get directions
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}