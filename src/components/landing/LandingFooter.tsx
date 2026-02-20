import { Link } from "react-router-dom";
import edenDarkLogo from "@/assets/eden_dark_logo.png";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <img src={edenDarkLogo} alt="Eden Desk" className="h-9 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              The all-in-one business productivity platform for modern professionals.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <div className="space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Features</h4>
            <div className="space-y-3">
              <span className="block text-sm text-muted-foreground">Invoices</span>
              <span className="block text-sm text-muted-foreground">Quotes</span>
              <span className="block text-sm text-muted-foreground">Letterheads</span>
              <span className="block text-sm text-muted-foreground">Task Manager</span>
              <span className="block text-sm text-muted-foreground">AI Drafting</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <div className="space-y-3">
              <a href="mailto:support@edendesk.com" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">support@edendesk.com</a>
              <Link to="/affiliate" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Affiliate Program</Link>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Eden Desk. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made by Express Internet Dev Team
          </p>
        </div>
      </div>
    </footer>
  );
};
