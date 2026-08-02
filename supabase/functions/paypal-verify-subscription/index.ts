import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  PAYPAL_PLAN_IDS,
  PAYPAL_PLAN_PRICES,
  addMonths,
  getPayPalAccessToken,
  paypalApiBase,
} from "../_shared/paypal.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const selectedPlan = String(body?.selected_plan || "").trim();
    const subscriptionId = String(body?.subscription_id || "").trim();
    const country = body?.country ? String(body.country).trim().toUpperCase() : null;

    if (!selectedPlan || !(selectedPlan in PAYPAL_PLAN_IDS)) {
      return json({ success: false, error: "Invalid plan selected" }, 400);
    }
    if (!subscriptionId) {
      return json({ success: false, error: "Missing PayPal subscription ID" }, 400);
    }

    const expectedPlanId = PAYPAL_PLAN_IDS[selectedPlan];
    const recurringPrice = PAYPAL_PLAN_PRICES[selectedPlan];

    const accessToken = await getPayPalAccessToken();
    const subRes = await fetch(
      `${paypalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
    );

    if (!subRes.ok) {
      console.error("PayPal subscription lookup failed", { status: subRes.status });
      return json({ success: false, error: "PayPal subscription could not be verified" }, 400);
    }

    const subscription = await subRes.json();

    if (subscription?.plan_id !== expectedPlanId) {
      console.error("PayPal plan mismatch", { selectedPlan });
      return json({ success: false, error: "PayPal subscription plan mismatch" }, 400);
    }

    const status = String(subscription?.status || "").toUpperCase();
    const acceptable = ["APPROVAL_PENDING", "APPROVED", "ACTIVE"];
    if (!acceptable.includes(status)) {
      return json({ success: false, error: `PayPal subscription is ${status.toLowerCase()}` }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency: if this subscription was already stored, do not duplicate.
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id, user_id")
      .eq("provider", "paypal")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle();

    if (existing && existing.user_id !== user.id) {
      return json({ success: false, error: "Subscription already linked to another account" }, 409);
    }

    const startTime = subscription?.start_time ? new Date(subscription.start_time) : new Date();
    const trialStart = Number.isNaN(startTime.getTime()) ? new Date() : startTime;
    const trialEnd = addMonths(trialStart, 3);
    const nextBilling = subscription?.billing_info?.next_billing_time
      ? new Date(subscription.billing_info.next_billing_time)
      : trialEnd;
    const renewal = Number.isNaN(nextBilling.getTime()) ? trialEnd : nextBilling;

    const record = {
      user_id: user.id,
      provider: "paypal",
      selected_plan: selectedPlan,
      country,
      currency: "USD",
      recurring_price: recurringPrice,
      trial_start_date: trialStart.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      billing_start_date: trialEnd.toISOString(),
      renewal_date: renewal.toISOString(),
      subscription_status: status === "ACTIVE" ? "trialing" : "pending",
      cancellation_status: "none",
      provider_plan_id: expectedPlanId,
      provider_subscription_id: subscriptionId,
      provider_reference: subscription?.id || subscriptionId,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updErr } = await admin
        .from("subscriptions")
        .update(record)
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await admin.from("subscriptions").insert(record);
      if (insErr) throw insErr;
    }

    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        subscription_plan: selectedPlan,
        trial_active: true,
        trial_used: true,
        trial_start_date: trialStart.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        payment_status: "trialing",
        billing_country: country,
      })
      .eq("user_id", user.id);

    if (profileErr) {
      console.error("Profile update failed after PayPal verification");
      throw profileErr;
    }

    return json({
      success: true,
      plan: selectedPlan,
      trial_end_date: trialEnd.toISOString(),
      subscription_status: record.subscription_status,
    });
  } catch (error) {
    console.error("PayPal verification error:", error instanceof Error ? error.message : "unknown");
    return json({ success: false, error: "PayPal subscription could not be verified" }, 500);
  }
});
