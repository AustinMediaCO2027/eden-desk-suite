import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";
import moonBg from "@/assets/moon-bg.jpg";

export const LandingHero = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-0 min-h-screen flex flex-col">
      {/* Moon background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={moonBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Centered content */}
      <div className="container mx-auto px-6 relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center rounded-full border border-border/50 bg-card/20 backdrop-blur-sm px-5 py-2 mb-10 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-foreground/50 mr-3 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">Business Productivity Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.05] mb-8 animate-fade-in tracking-tight max-w-4xl" style={{ animationDelay: "0.1s" }}>
          Run Your
          <br />
          Business From
          <br />
          <span className="text-muted-foreground/40">One Desk.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Create invoices, quotes, letterheads & manage tasks — beautifully designed, effortlessly delivered.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-10 h-14 gap-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] transition-all duration-300">
              Get Started (for free)
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
          <span className="text-sm text-muted-foreground">Trusted by <span className="text-foreground font-bold">17,000+</span> businesses</span>
        </div>
      </div>

      {/* Dashboard mockup below — full width */}
      <div className="relative mt-16 md:mt-24 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <div className="container mx-auto px-6">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-12 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, hsl(0 0% 100% / 0.04) 0%, transparent 70%)" }} />
            <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(255,255,255,0.08)] border border-border/40">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
