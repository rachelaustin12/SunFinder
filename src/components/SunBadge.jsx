import { Sun, CloudSun, Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sunConfig = {
  "full_sun": {
    icon: Sun,
    label: "Full Sun",
    className: "bg-primary text-primary-foreground border-primary"
  },
  "partial_sun": {
    icon: CloudSun,
    label: "Partial Sun",
    className: "bg-secondary text-secondary-foreground border-secondary"
  },
  "shade": {
    icon: Cloud,
    label: "Mostly Shade",
    className: "bg-muted text-muted-foreground border-muted"
  }
};

export default function SunBadge({ status }) {
  const config = sunConfig[status] || sunConfig["partial_sun"];
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.className} gap-1.5 px-3 py-1 text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}