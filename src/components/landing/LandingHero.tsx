import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-0">
      {/* Orb / glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Tag */}
        <div className="inline-flex items-center rounded-full border border-border/60 bg-card/50 backdrop-blur-sm px-5 py-2 mb-10 animate-fade-in">
          <span className="text-xs font-medium text-muted-foreground">Smart Finance, Simplified</span>
        </div>

        {/* Main heading - large serif-inspired */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] mb-6 animate-fade-in tracking-tight" style={{ animationDelay: "0.1s" }}>
          Financial clarity, built{" "}
          <span className="text-violet-400">for</span>
          <br />
          <span className="text-violet-400">the next gener</span>
          <span className="text-violet-400/60">ation.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Real-time insights, powerful analytics, and complete control over your finances — all in one secure platform.
        </p>

        {/* Social proof avatars */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-violet-400 to-blue-400"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Trusted already by <span className="text-foreground font-medium">1.2k+</span></span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-8 h-12 gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0">
              Start Managing Smarter
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border text-foreground hover:bg-secondary">
              Explore The Platform
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
