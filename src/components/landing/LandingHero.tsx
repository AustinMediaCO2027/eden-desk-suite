import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-0">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-foreground/[0.03] blur-3xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Award badge */}
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3 mb-10 animate-fade-in">
          <div className="flex gap-0.5">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold leading-tight">Business Document Platform of the Year</p>
            <p className="text-[10px] text-muted-foreground">Eden Desk Awards 2026 — Africa</p>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 animate-fade-in eden-glow-text" style={{ animationDelay: "0.1s" }}>
          <span className="text-muted-foreground">Professional</span>
          <br />
          document software for
          <br />
          growing businesses
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Manage your invoices, quotes, letterheads, tasks & AI drafting — all from one beautifully designed platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-8 h-12 gap-2">
              Start my free trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border text-foreground hover:bg-secondary">
              Explore Features
            </Button>
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mt-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
