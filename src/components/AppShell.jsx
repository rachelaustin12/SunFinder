import { Link, useLocation } from "react-router-dom";
import { Sun, Heart, Settings } from "lucide-react";
import { useState } from "react";
import SettingsSheet from "./SettingsSheet";

export default function AppShell({ children }) {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { path: "/", label: "Search", icon: Sun },
    { path: "/my-sunny-spots", label: "Favourites", icon: Heart },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border/60 flex items-center justify-between px-4"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}
      >
        <Link to="/" className="flex items-center gap-2 select-none">
          <Sun className="w-6 h-6 text-primary animate-pulse-glow" />
          <span className="font-display font-bold text-lg text-foreground">Where's The Sun?</span>
        </Link>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-muted transition-colors select-none tap-highlight-none"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Page content with top/bottom padding for fixed bars */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
          paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* Fixed Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 select-none transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "fill-primary/20" : ""}`} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}