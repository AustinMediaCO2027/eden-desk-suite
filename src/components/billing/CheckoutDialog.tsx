import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { loadPayPalSdk } from "@/lib/paypal-sdk";
import {
  BILLING_COUNTRIES,
  PAYFAST_CHECKOUT_COPY,
  PAYFAST_PLAN_PRICES,
  PAYPAL_CHECKOUT_COPY,
  PAYPAL_CONTAINER_IDS,
  PAYPAL_PLAN_IDS,
  PAYPAL_PLAN_PRICES,
  PLAN_CARDS,
  PlanKey,
  isPlanKey,
  isSouthAfrica,
} from "@/config/plans";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlanKey | null;
}

export const CheckoutDialog = ({ open, onOpenChange, plan }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [country, setCountry] = useState<string>("");
  const [savingCountry, setSavingCountry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payfastLoading, setPayfastLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const paypalRendered = useRef<string | null>(null);

  const savedCountry = (profile as any)?.billing_country as string | undefined;
  const effectiveCountry = savedCountry || null;

  useEffect(() => {
    if (open) {
      setError(null);
      setCountry(savedCountry || "");
    } else {
      paypalRendered.current = null;
    }
  }, [open, savedCountry]);

  const planCard = useMemo(() => PLAN_CARDS.find((p) => p.key === plan) || null, [plan]);
  const provider = effectiveCountry ? (isSouthAfrica(effectiveCountry) ? "payfast" : "paypal") : null;

  const showCheckoutError = (message: string) => setError(message);

  const handleSaveCountry = async () => {
    if (!country) {
      showCheckoutError("Please select your billing country to continue.");
      return;
    }
    setSavingCountry(true);
    setError(null);
    try {
      const updateError = await updateProfile({ billing_country: country } as any);
      if (updateError) throw new Error(updateError.message);
    } catch (err: any) {
      showCheckoutError(err?.message || "Could not save your billing country. Please try again.");
    } finally {
      setSavingCountry(false);
    }
  };

  const startPayFast = async () => {
    if (!user) {
      showCheckoutError("Please sign in before starting your free trial.");
      return;
    }
    if (!plan || !isPlanKey(plan)) {
      showCheckoutError("Please select a valid plan.");
      return;
    }

    setPayfastLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("payfast-checkout", {
        body: {
          planName: planCard?.name,
          planId: plan,
          period: "/month",
          userEmail: user.email,
          userId: user.id,
          companyName: profile?.company_name,
          trialMonths: 3,
          country: effectiveCountry,
          returnUrl: `${window.location.origin}/dashboard?payment=success&plan=${plan}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled`,
        },
      });

      if (fnError) throw fnError;
      if (!data?.paymentUrl || !data?.params) {
        throw new Error("PayFast checkout could not be started. Please try again.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      form.target = "_self";
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
      console.error("PayFast checkout error:", err);
      showCheckoutError(
        err?.message || "PayFast checkout could not be started. Please try again."
      );
      setPayfastLoading(false);
    }
  };

  const verifyPayPalSubscriptionOnBackend = async (payload: {
    provider: "paypal";
    subscriptionID: string;
    selectedPlan: PlanKey;
    paypalPlanId: string;
  }) => {
    const { data, error: fnError } = await supabase.functions.invoke(
      "paypal-verify-subscription",
      {
        body: {
          provider: payload.provider,
          subscription_id: payload.subscriptionID,
          selected_plan: payload.selectedPlan,
          paypal_plan_id: payload.paypalPlanId,
          country: effectiveCountry,
        },
      }
    );
    if (fnError) throw new Error(fnError.message || "PayPal verification failed");
    if (!data?.success) throw new Error(data?.error || "PayPal verification failed");
    return data;
  };

  // Render PayPal subscription buttons once the SDK is available.
  useEffect(() => {
    if (!open || provider !== "paypal" || !plan || !isPlanKey(plan)) return;
    if (paypalRendered.current === plan) return;

    let cancelled = false;
    const containerId = PAYPAL_CONTAINER_IDS[plan];

    const render = async () => {
      setPaypalLoading(true);
      setError(null);
      try {
        const paypal = await loadPayPalSdk();
        if (cancelled) return;

        const container = document.getElementById(containerId);
        if (!container) throw new Error("Checkout could not be displayed. Please try again.");
        container.innerHTML = "";

        const planId = PAYPAL_PLAN_IDS[plan];
        if (!planId) throw new Error("Invalid PayPal plan selected");
        if (!paypal) throw new Error("PayPal SDK has not loaded");

        await paypal
          .Buttons({
            style: { shape: "rect", color: "black", layout: "vertical", label: "subscribe" },
            createSubscription: (_data: unknown, actions: any) =>
              actions.subscription.create({ plan_id: planId }),
            onApprove: async (data: any) => {
              const subscriptionID = data?.subscriptionID;
              if (!subscriptionID) {
                showCheckoutError("PayPal did not return a subscription. Please try again.");
                return;
              }
              try {
                setVerifying(true);
                await verifyPayPalSubscriptionOnBackend({
                  provider: "paypal",
                  subscriptionID,
                  selectedPlan: plan,
                  paypalPlanId: planId,
                });
                onOpenChange(false);
                navigate("/dashboard?payment=success&provider=paypal");
              } catch (err: any) {
                console.error("PayPal verification error:", err);
                showCheckoutError(
                  err?.message ||
                    "We could not confirm your PayPal subscription. Please contact support."
                );
              } finally {
                setVerifying(false);
              }
            },
            onCancel: () => showCheckoutError("PayPal checkout was cancelled."),
            onError: (err: unknown) => {
              console.error("PayPal subscription error:", err);
              showCheckoutError(
                "PayPal subscription could not be completed. Please try again."
              );
            },
          })
          .render(`#${containerId}`);

        paypalRendered.current = plan;
      } catch (err: any) {
        if (!cancelled) {
          console.error("PayPal render error:", err);
          showCheckoutError(
            err?.message === "PayPal SDK has not loaded"
              ? "PayPal could not load. Please check your connection and try again."
              : err?.message || "PayPal could not load. Please try again."
          );
        }
      } finally {
        if (!cancelled) setPaypalLoading(false);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [open, provider, plan]);

  const paypalPrice = plan && isPlanKey(plan) ? PAYPAL_PLAN_PRICES[plan] : null;
  const payfastPrice = plan && isPlanKey(plan) ? PAYFAST_PLAN_PRICES[plan] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {planCard ? `Start your ${planCard.name} free trial` : "Start your free trial"}
          </DialogTitle>
        </DialogHeader>

        {!plan || !isPlanKey(plan) ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please select a valid plan to continue.</AlertDescription>
          </Alert>
        ) : !user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to start your 3-month free trial.
            </p>
            <Button className="w-full" onClick={() => navigate(`/auth?mode=signup&plan=${plan}`)}>
              Sign in to continue
            </Button>
          </div>
        ) : profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !effectiveCountry ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select your billing country so we can set up the right payment method.
            </p>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select billing country" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {BILLING_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full" onClick={handleSaveCountry} disabled={savingCountry}>
              {savingCountry ? "Saving..." : "Continue"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">{planCard?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {provider === "payfast"
                  ? `Free for 3 months, then R${payfastPrice?.toFixed(2)}/pm`
                  : `Free for 3 months, then $${paypalPrice?.recurringPrice.toFixed(2)} USD/month`}
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {provider === "payfast" ? PAYFAST_CHECKOUT_COPY : PAYPAL_CHECKOUT_COPY}
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {provider === "payfast" ? (
              <Button className="w-full" onClick={startPayFast} disabled={payfastLoading}>
                {payfastLoading ? "Redirecting to PayFast..." : "Continue with PayFast"}
              </Button>
            ) : (
              <div className="space-y-2">
                {(paypalLoading || verifying) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {verifying ? "Confirming your subscription..." : "Loading PayPal..."}
                  </div>
                )}
                <div id={PAYPAL_CONTAINER_IDS[plan]} />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCountry("");
                updateProfile({ billing_country: null } as any);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Change billing country
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
