import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Info, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useFavourites } from "@/hooks/useFavourites";

export default function SettingsSheet({ open, onClose }) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { user } = useAuth();
  const { clearAllFavourites } = useFavourites();

  const handleDeleteAccount = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsDeleting(true);
    try {
      if (user) {
        await base44.entities.User.delete(user.id);
      }
    } catch (_) {
      // best-effort — proceed regardless
    }
    localStorage.clear();
    base44.auth.logout("/");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* About */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">App</p>
            <Link to="/about" onClick={onClose} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 hover:bg-muted transition-colors">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">How it works</span>
            </Link>
          </div>

          {/* Reset data */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Data</p>
            <div className="bg-muted/50 rounded-xl p-4">
              {!confirmReset ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setConfirmReset(true)}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Fresh (Clear Saved Spots)
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium text-center">Clear all your saved pub spots?</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => { clearAllFavourites(); setConfirmReset(false); onClose(); }}>
                      Yes, clear all
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</p>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              {!confirming ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account Data
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-destructive font-medium text-center">Are you sure? This clears all your saved spots and data.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirming(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      Yes, delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pb-2">
            Sun positions are estimated. Always check ahead!
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}