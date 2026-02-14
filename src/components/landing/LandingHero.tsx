import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LandingHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-foreground/[0.03] blur-3xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 mb-8 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
          <span className="text-xs text-muted-foreground tracking-wide uppercase">7-day free trial</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 animate-fade-in eden-glow-text" style={{ animationDelay: "0.1s" }}>
          Run Your Business
          <br />
          <span className="text-muted-foreground">From One Desk.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Invoices. Quotes. Letterheads. Tasks. AI Drafting.
          <br className="hidden md:block" />
          Everything your business needs, beautifully organized.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-base px-8 h-12 gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border text-foreground hover:bg-secondary">
              View Pricing
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 max-w-lg mx-auto mt-20 gap-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          {[
            { value: "10K+", label: "Businesses" },
            { value: "500K+", label: "Documents Created" },
            { value: "99.9%", label: "Uptime" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
