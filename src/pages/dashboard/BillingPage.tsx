import { useState } from "react";
import { Check, Calendar, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

const plans = [
  {
    name: "Standard",
    zarPrice: 39.99,
    period: "/month",
    payfastAmount: "39.99",
    features: ["Create invoices", "Create quotes", "Download PDF", "Email sending"],
    planId: "standard",
  },
  {
    name: "Silver",
    zarPrice: 75.99,
    period: "/month",
    payfastAmount: "75.99",
    features: ["Send Invoice / Quotes", "Letterheads", "Gemini AI (5/day)", "Email sending"],
    highlighted: true,
    planId: "silver",
  },
  {
    name: "Premium",
    zarPrice: 99.99,
    period: "/month",
    payfastAmount: "99.99",
    features: ["Everything in Silver", "Task manager", "Unlimited AI", "Priority support"],
    planId: "premium",
  },
  {
    name: "Yearly",
    zarPrice: 985.99,
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
  const { convert, currency } = useCurrency();
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
          isTrial: false,
          returnUrl: `${window.location.origin}/dashboard?payment=success&plan=${plan.planId}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled`,
        },
      });

      if (error) throw error;

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

  const isPaidPlan = ["standard", "silver", "premium", "yearly"].includes(currentPlan);
  const billingCycle = currentPlan === "yearly" ? "Yearly" : "Monthly";
  const addOnStorage = (profile as any)?.add_on_storage ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground text-sm">Manage your subscription and payment method.</p>
        </div>
        <CurrencySwitcher />
      </div>

      {/* Current Plan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Plan</span>
            </div>
            <p className="text-lg font-bold capitalize">{planDisplayName}</p>
            <p className="text-xs text-muted-foreground">{isPaidPlan ? "Active" : "Choose a plan to get started"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Billing Cycle</span>
            </div>
            <p className="text-lg font-bold">{isPaidPlan ? billingCycle : "—"}</p>
            <p className="text-xs text-muted-foreground">{isPaidPlan ? "Recurring via PayFast" : "No active subscription"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Storage Add-On</span>
            </div>
            <p className="text-lg font-bold">{addOnStorage > 0 ? `${(addOnStorage / (1024 * 1024 * 1024)).toFixed(0)} GB` : "None"}</p>
            <p className="text-xs text-muted-foreground">{addOnStorage > 0 ? "Active add-on" : "Available on Silver+"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Trial Status</span>
            </div>
            <p className="text-lg font-bold">{(profile as any)?.trial_used ? "Used" : "Available"}</p>
            <p className="text-xs text-muted-foreground">{(profile as any)?.trial_used ? "One-time trial completed" : "7-day free trial"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${plan.highlighted ? "border-foreground bg-foreground/5" : "border-border bg-card"} eden-card-hover`}>
            <h3 className="font-semibold mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">{convert(plan.zarPrice)}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
              {currency.code !== "ZAR" && (
                <p className="text-[10px] text-muted-foreground mt-1">Billed in R{plan.zarPrice.toFixed(2)} ZAR</p>
              )}
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
              {loading === plan.planId ? "Processing..." : currentPlan === plan.planId ? "Current Plan" : "Get Started"}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Billed securely in South African Rand (ZAR).
      </p>

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
