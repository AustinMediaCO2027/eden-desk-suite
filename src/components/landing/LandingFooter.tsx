import edenDarkLogo from "@/assets/eden_dark_logo.png";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <img src={edenDarkLogo} alt="Eden Desk" className="h-6" />
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Eden Desk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
