import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Standard",
    price: "R39.99",
    period: "/month",
    description: "Perfect for freelancers",
    features: ["Create invoices", "Create quotes", "Download PDF", "Email sending"],
    highlighted: false,
  },
  {
    name: "Silver",
    price: "R59.99",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Everything in Standard",
      "Create & send letterheads",
      "AI drafting assistant",
      "5 AI prompts per day",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "R99.99",
    period: "/month",
    description: "For power users",
    features: [
      "Everything in Silver",
      "Task manager",
      "Unlimited AI prompts",
      "Priority support",
    ],
    highlighted: false,
  },
  {
    name: "Yearly",
    price: "R985.99",
    period: "/year",
    description: "Best value — save 18%",
    features: [
      "Unlimited everything",
      "All features included",
      "Unlimited AI prompts",
      "Priority support",
    ],
    highlighted: false,
    badge: "Best Value",
  },
];

export const LandingPricing = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing.
          </h2>
          <p className="text-muted-foreground text-lg">
            Start with a 7-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-violet-500/50 bg-violet-500/5"
                  : "border-border bg-card/50 backdrop-blur-sm"
              } eden-card-hover`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-violet-600 text-white px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button
                  className={`w-full ${plan.highlighted ? "bg-violet-600 hover:bg-violet-700 text-white border-0" : ""}`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
