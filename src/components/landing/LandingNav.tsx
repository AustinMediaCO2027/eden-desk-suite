import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/eden_desk_logo_full.png";

export const LandingNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 eden-glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoFull} alt="Eden Desk" className="h-7 invert" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
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
            <Button size="sm">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
