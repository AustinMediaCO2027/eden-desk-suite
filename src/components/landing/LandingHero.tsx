import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-0 min-h-[90vh] flex flex-col justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-foreground/[0.03] to-transparent blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div className="text-left">
            <div className="inline-flex items-center rounded-full border border-border/60 bg-card/30 backdrop-blur-sm px-4 py-1.5 mb-8 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/60 mr-2" />
              <span className="text-xs font-medium text-muted-foreground">Business Productivity Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 animate-fade-in tracking-tight" style={{ animationDelay: "0.1s" }}>
              Run Your
              <br />
              Business From
              <br />
              <span className="text-muted-foreground/60">One Desk.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
              Create invoices, quotes, letterheads & manage tasks — all with ease.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-base px-8 h-13 gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all">
                  Start 7-Day Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="text-base px-8 h-13 border-border/60 text-foreground hover:bg-card rounded-xl">
                  View Pricing
                </Button>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/20"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Trusted by <span className="text-foreground font-semibold">1,200+</span> businesses</span>
            </div>
          </div>

          {/* Right column - Dashboard mockup */}
          <div className="relative animate-slide-up hidden lg:block" style={{ animationDelay: "0.3s" }}>
            <div className="absolute -inset-8 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute -inset-4 bg-gradient-to-r from-background/50 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-foreground/5 border border-border/40">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Mobile mockup */}
        <div className="relative mt-16 animate-slide-up lg:hidden" style={{ animationDelay: "0.4s" }}>
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
