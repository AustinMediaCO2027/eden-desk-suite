import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { useSubscription } from "@/hooks/useSubscription";

const plans = [
  {
    name: "Standard",
    price: "R39.99",
    period: "/month",
    payfastAmount: "39.99",
    features: ["Create invoices", "Create quotes", "Download PDF", "Email sending"],
    planId: "standard",
  },
  {
    name: "Silver",
    price: "R59.99",
    period: "/month",
    payfastAmount: "59.99",
    features: ["Send Invoice / Quotes", "Letterheads", "AI drafting (5/day)", "Email sending"],
    highlighted: true,
    planId: "silver",
  },
  {
    name: "Premium",
    price: "R99.99",
    period: "/month",
    payfastAmount: "99.99",
    features: ["Everything in Silver", "Task manager", "Unlimited AI", "Priority support"],
    planId: "premium",
  },
  {
    name: "Yearly",
    price: "R985.99",
    period: "/year",
    payfastAmount: "985.99",
    features: ["Unlimited everything", "All features", "Unlimited AI", "Priority support"],
    planId: "yearly",
  },
];

const BillingPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { planDisplayName, currentPlan } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    setLoading(plan.planId);

    try {
      const { data, error } = await supabase.functions.invoke("payfast-checkout", {
        body: {
          planName: plan.name,
          planId: plan.planId,
          amount: plan.payfastAmount,
          period: plan.period,
          userEmail: user.email,
          userId: user.id,
          companyName: profile?.company_name,
          isTrial: true,
          returnUrl: `${window.location.origin}/dashboard?payment=success&plan=${plan.planId}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled`,
        },
      });

      if (error) throw error;

      // Build and submit form - target _top to break out of iframe
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      form.target = "_top";

      Object.entries(data.params as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("PayFast error:", err);
      toast({ title: "Payment error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-muted-foreground text-sm">Manage your subscription and payment method.</p>

      {/* Current Plan Display */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-1">Current Plan</h3>
        <p className="text-sm text-muted-foreground">
          <span className="capitalize font-medium text-foreground">{planDisplayName}</span>
          {currentPlan !== "free" && " — Active"}
          {currentPlan === "free" && " — Choose a plan to get started"}
        </p>
      </div>

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
            <Button
              variant={plan.highlighted ? "default" : "outline"}
              className="w-full"
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.planId || currentPlan === plan.planId}
            >
              {loading === plan.planId ? "Processing..." : currentPlan === plan.planId ? "Current Plan" : "Start 7-Day Free Trial"}
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Payments are processed securely via PayFast. Click subscribe above to set up your recurring payment.
        </p>
      </div>
    </div>
  );
};

export default BillingPage;
