import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Heart, Settings, ArrowLeft, Trophy, Footprints } from "lucide-react";
import { useState } from "react";
import SettingsSheet from "./SettingsSheet";
import Footer from "./Footer";

const MAIN_ROUTES = ["/", "/my-sunny-spots", "/leaderboard", "/sunny-trails"];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isMainRoute = MAIN_ROUTES.includes(location.pathname);

  const tabs = [
  { path: "/", label: "Search", icon: Sun },
  { path: "/my-sunny-spots", label: "Faves", icon: Heart },
  { path: "/leaderboard", label: "Top Rated", icon: Trophy },
  { path: "/sunny-trails", label: "Sunny Strolls", icon: Footprints }];

  // When on a stack route, tab clicks should reset to the tab root
  const handleTabClick = (e, path) => {
    if (!isMainRoute) {
      e.preventDefault();
      navigate(path, { replace: true });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border/60 flex items-center justify-between px-4"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}>
        
        {isMainRoute ?
        <Link to="/" className="flex items-center gap-2 select-none">
            <Sun className="w-6 h-6 text-primary animate-pulse-glow" />
            <span className="font-display font-bold text-lg text-foreground"></span>
          </Link> :

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 select-none text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back">
          
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        }
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-muted transition-colors select-none"
          aria-label="Settings">
          
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Page content with top/bottom padding for fixed bars */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
          paddingBottom: isMainRoute ? "calc(60px + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)"
        }}>
        
        {children}
        <Footer />
      </main>

      {/* Fixed Bottom Nav — only shown on tab routes */}
      {isMainRoute && (
        <nav
          role="tablist"
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          
          {tabs.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                role="tab"
                aria-selected={active}
                aria-label={label}
                tabIndex={active ? 0 : -1}
                onClick={(e) => handleTabClick(e, path)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 select-none transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                }>
                <Icon className={`w-5 h-5 ${active ? "fill-primary/20" : ""}`} aria-hidden="true" />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>);
          })}
        </nav>
      )}

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>);

}