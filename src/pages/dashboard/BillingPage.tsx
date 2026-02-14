import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Standard",
    price: "R39.99",
    period: "/month",
    features: ["Create invoices", "Create quotes", "Download PDF", "Email sending"],
  },
  {
    name: "Silver",
    price: "R59.99",
    period: "/month",
    features: ["Everything in Standard", "Letterheads", "AI drafting (5/day)", "Email sending"],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "R99.99",
    period: "/month",
    features: ["Everything in Silver", "Task manager", "Unlimited AI", "Priority support"],
  },
  {
    name: "Yearly",
    price: "R985.99",
    period: "/year",
    features: ["Unlimited everything", "All features", "Unlimited AI", "Priority support"],
  },
];

const BillingPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-muted-foreground text-sm">Manage your subscription and payment method.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${plan.highlighted ? "border-foreground bg-foreground/5" : "border-border bg-card"} eden-card-hover`}>
            <h3 className="font-semibold mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
              Subscribe
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Payments are processed securely via PayFast. Click subscribe above to set up your payment.
        </p>
      </div>
    </div>
  );
};

export default BillingPage;
