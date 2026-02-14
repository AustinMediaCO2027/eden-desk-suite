import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import moonBg from "@/assets/moon-bg.jpg";

export const LandingCTA = () => {
  return (
    <section className="py-28 md:py-40 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl border border-border/30 overflow-hidden py-24 md:py-32 px-8 text-center">
          {/* Moon background */}
          <img src={moonBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />

          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 relative z-10 leading-tight">
            Ready to streamline
            <br />
            your business?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto mb-12 relative z-10">
            Start your 7-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-base px-12 h-14 gap-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] transition-all duration-300">
                Start 7-Day Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="mailto:support@edendesk.co">
              <Button variant="outline" size="lg" className="text-base px-12 h-14 border-border/50 text-foreground hover:bg-card/50 rounded-xl font-semibold">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
