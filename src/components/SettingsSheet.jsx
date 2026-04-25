import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function SettingsSheet({ open, onClose }) {
  const [confirming, setConfirming] = useState(false);

  const handleDeleteAccount = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    // Clear all local data
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
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
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account Data
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-destructive font-medium text-center">Are you sure? This clears all your saved spots and data.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirming(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={handleDeleteAccount}>Yes, delete</Button>
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