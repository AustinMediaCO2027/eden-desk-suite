import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LandingCTA = () => {
  return (
    <section className="py-28 md:py-36 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl border border-border/40 bg-card/20 overflow-hidden py-20 px-8 text-center">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-foreground/[0.02] blur-3xl rounded-full" />

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-5 relative z-10">
            Ready to streamline
            <br />
            your business?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10 relative z-10">
            Start your 7-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-base px-10 h-13 gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all">
                Start 7-Day Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="mailto:support@edendesk.co">
              <Button variant="outline" size="lg" className="text-base px-10 h-13 border-border/60 text-foreground hover:bg-card rounded-xl">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
