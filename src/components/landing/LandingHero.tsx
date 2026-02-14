import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-28 pb-0 min-h-screen flex flex-col justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central radial glow */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full" style={{ background: "radial-gradient(circle, hsl(0 0% 100% / 0.04) 0%, transparent 70%)" }} />
        {/* Top line accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="text-left max-w-xl">
            <div className="inline-flex items-center rounded-full border border-border/50 bg-card/20 backdrop-blur-sm px-5 py-2 mb-10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-foreground/50 mr-3 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide">Business Productivity Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-extrabold leading-[1.02] mb-8 animate-fade-in tracking-tight" style={{ animationDelay: "0.1s" }}>
              Run Your
              <br />
              Business From
              <br />
              <span className="text-muted-foreground/40">One Desk.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
              Create invoices, quotes, letterheads & manage tasks — all with ease.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-base px-10 h-14 gap-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.12)] transition-all duration-300">
                  Start 7-Day Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="text-base px-10 h-14 border-border/50 text-foreground hover:bg-card/50 rounded-xl font-semibold">
                  View Pricing
                </Button>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-14 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-background"
                    style={{ background: `linear-gradient(135deg, hsl(0 0% ${70 - i * 10}%) 0%, hsl(0 0% ${40 - i * 5}%) 100%)` }}
                  />
                ))}
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Trusted by <span className="text-foreground font-bold">1,200+</span> businesses</span>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard mockup */}
          <div className="relative animate-slide-up hidden lg:block" style={{ animationDelay: "0.3s" }}>
            {/* Glow behind mockup */}
            <div className="absolute -inset-12 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.03) 0%, transparent 70%)" }} />
            <div className="absolute -inset-8 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(255,255,255,0.06)] border border-border/40">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Mobile mockup */}
        <div className="relative mt-20 animate-slide-up lg:hidden" style={{ animationDelay: "0.4s" }}>
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
