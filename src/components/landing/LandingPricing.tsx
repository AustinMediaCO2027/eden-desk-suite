import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import abstractBg from "@/assets/abstract-bg.jpg";
import { useAuth } from "@/hooks/useAuth";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import { PLAN_CARDS, PRICING_DISCLAIMER, PlanKey } from "@/config/plans";

export const LandingPricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleGetStarted = (plan: PlanKey) => {
    if (!user) {
      navigate(`/auth?mode=signup&plan=${plan}`);
      return;
    }
    setCheckoutPlan(plan);
    setCheckoutOpen(true);
  };

  return (
    <section id="pricing" className="relative py-28 md:py-36 border-t border-border/30 overflow-hidden">
      {/* Abstract background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={abstractBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Plans that grow with you
          </h2>
          <p className="text-muted-foreground text-lg">
            3 months free trial on every plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLAN_CARDS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-foreground/30 bg-card/40 shadow-[0_0_40px_rgba(255,255,255,0.03)]"
                  : "border-border/40 bg-card/20 hover:border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-foreground text-background px-4 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </span>
              )}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold">Free</span>
                {!plan.isFree && (
                  <span className="text-muted-foreground text-sm ml-1">/3 months</span>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.isFree ? "Free forever" : `then R${plan.zarPrice.toFixed(2)}/pm`}
                </p>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-xl h-11 ${
                  plan.highlighted
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    : "border-border/60"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() =>
                  plan.isFree ? navigate("/auth?mode=signup") : handleGetStarted(plan.key)
                }
              >
                Get started for free
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          {PRICING_DISCLAIMER}
        </p>

        <div className="text-center mt-6">
          <Link to="/affiliate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Earn recurring income promoting Eden Desk. <span className="underline font-medium">Join our affiliate program →</span>
          </Link>
        </div>
      </div>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} plan={checkoutPlan} />
    </section>
  );
};
