import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-4 mt-8 text-center">
      <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        Privacy Policy
      </Link>
    </footer>
  );
}