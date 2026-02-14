import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

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
    features: ["Everything in Standard", "Letterheads", "AI drafting (5/day)", "Email sending"],
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

const PAYFAST_URL = "https://www.payfast.co.za/eng/process";

const BillingPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    // Build PayFast form and submit
    const form = document.createElement("form");
    form.method = "POST";
    form.action = PAYFAST_URL;

    const params: Record<string, string> = {
      merchant_id: "10000100", // Replace with your PayFast merchant ID
      merchant_key: "46f0cd694581a", // Replace with your PayFast merchant key
      return_url: `${window.location.origin}/dashboard/billing?status=success`,
      cancel_url: `${window.location.origin}/dashboard/billing?status=cancelled`,
      notify_url: `${window.location.origin}/dashboard/billing`, // Replace with your webhook
      name_first: profile?.company_name || user.email?.split("@")[0] || "",
      email_address: user.email || "",
      amount: plan.payfastAmount,
      item_name: `Eden Desk ${plan.name} Plan`,
      item_description: `${plan.name} subscription - ${plan.period}`,
      custom_str1: user.id,
      custom_str2: plan.planId,
      subscription_type: plan.planId === "yearly" ? "1" : "1",
      recurring_amount: plan.payfastAmount,
      frequency: plan.planId === "yearly" ? "6" : "3",
      cycles: "0",
    };

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-muted-foreground text-sm">Manage your subscription and payment method.</p>

      {profile?.subscription_plan && profile.subscription_plan !== "free" && profile.subscription_plan !== "trial" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-1">Current Plan</h3>
          <p className="text-sm text-muted-foreground capitalize">{profile.subscription_plan} — Active</p>
        </div>
      )}

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
            >
              Subscribe via PayFast
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
