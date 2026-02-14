import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import edenDarkLogo from "@/assets/eden_dark_logo.png";

export const LandingNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)" }}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={edenDarkLogo} alt="Eden Desk" className="h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
