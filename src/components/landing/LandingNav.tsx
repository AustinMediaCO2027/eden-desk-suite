import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import edenDarkLogo from "@/assets/eden_dark_logo.png";

export const LandingNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 eden-glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={edenDarkLogo} alt="Eden Desk" className="h-7" />
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm px-2 py-1">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-full hover:bg-secondary/50">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-full hover:bg-secondary/50">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-full hover:bg-secondary/50">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-0">
              Signup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
