import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Calendar, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import {
  PLAN_CARDS,
  PRICING_DISCLAIMER,
  PlanKey,
  isPlanKey,
  isSouthAfrica,
  PAYPAL_PLAN_PRICES,
} from "@/config/plans";

const BillingPage = () => {
  const { profile } = useProfile();
  const { planDisplayName, currentPlan } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const billingCountry = (profile as any)?.billing_country as string | undefined;
  const usesPayFast = isSouthAfrica(billingCountry);

  // Open checkout automatically when arriving with ?plan=
  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam && isPlanKey(planParam)) {
      setCheckoutPlan(planParam);
      setCheckoutOpen(true);
      searchParams.delete("plan");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCheckout = (plan: PlanKey) => {
    setCheckoutPlan(plan);
    setCheckoutOpen(true);
  };

  const isPaidPlan = ["silver", "premium", "yearly"].includes(currentPlan);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Plan</span>
            </div>
            <p className="text-lg font-bold capitalize">{planDisplayName}</p>
            <p className="text-xs text-muted-foreground">{isPaidPlan ? "Active" : "Free, ad-supported access"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Billing Cycle</span>
            </div>
            <p className="text-lg font-bold">{isPaidPlan ? "Monthly" : "—"}</p>
            <p className="text-xs text-muted-foreground">
              {isPaidPlan
                ? `Recurring via ${usesPayFast ? "PayFast" : "PayPal"}`
                : "No active subscription"}
            </p>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_CARDS.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-xl border p-6 flex flex-col ${plan.highlighted ? "border-foreground bg-foreground/5" : "border-border bg-card"} eden-card-hover`}
          >
            <h3 className="font-semibold mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">Free</span>
              <span className="text-muted-foreground text-sm"> {plan.free ? "forever" : "/3 months"}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.free
                  ? "R0.00 — ad-supported"
                  : usesPayFast || !billingCountry
                  ? `then R${plan.zarPrice.toFixed(2)}/pm`
                  : `then $${PAYPAL_PLAN_PRICES[plan.key].recurringPrice.toFixed(2)} USD/month`}
              </p>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlighted ? "default" : "outline"}
              className="w-full"
              onClick={() => openCheckout(plan.key)}
              disabled={currentPlan === plan.key || plan.free}
            >
              {currentPlan === plan.key ? "Current Plan" : plan.free ? "Free plan" : "Get started for free"}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
        {PRICING_DISCLAIMER}
      </p>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          South African customers are billed through PayFast. Customers outside South Africa are
          billed through PayPal. Your payment details are collected at checkout and billing begins
          after the 3-month free trial.
        </p>
      </div>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} plan={checkoutPlan} />
    </div>
  );
};

export default BillingPage;
