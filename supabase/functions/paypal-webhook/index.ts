import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPayPalAccessToken, paypalApiBase } from "../_shared/paypal.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error("PayPal webhook: invalid JSON payload");
      return new Response("INVALID_PAYLOAD", { status: 400, headers: corsHeaders });
    }

    const webhookId = (Deno.env.get("PAYPAL_WEBHOOK_ID") || "").trim();
    if (!webhookId) {
      console.error("PayPal webhook: PAYPAL_WEBHOOK_ID not configured");
      return new Response("NOT_CONFIGURED", { status: 500, headers: corsHeaders });
    }

    const requiredHeaders = [
      "paypal-auth-algo",
      "paypal-cert-url",
      "paypal-transmission-id",
      "paypal-transmission-sig",
      "paypal-transmission-time",
    ];
    if (requiredHeaders.some((h) => !req.headers.get(h))) {
      console.error("PayPal webhook: missing signature headers");
      return new Response("MISSING_SIGNATURE_HEADERS", { status: 400, headers: corsHeaders });
    }

    let accessToken: string;
    try {
      accessToken = await getPayPalAccessToken();
    } catch (authError) {
      console.error(
        "PayPal webhook auth failed:",
        authError instanceof Error ? authError.message : "unknown",
      );
      return new Response("PAYPAL_AUTH_FAILED", { status: 503, headers: corsHeaders });
    }

    const verifyRes = await fetch(`${paypalApiBase()}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: req.headers.get("paypal-auth-algo"),
        cert_url: req.headers.get("paypal-cert-url"),
        transmission_id: req.headers.get("paypal-transmission-id"),
        transmission_sig: req.headers.get("paypal-transmission-sig"),
        transmission_time: req.headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });

    const verifyData = verifyRes.ok ? await verifyRes.json() : null;
    if (verifyData?.verification_status !== "SUCCESS") {
      console.error("PayPal webhook signature verification failed", { eventType: event?.event_type });
      return new Response("INVALID_SIGNATURE", { status: 400, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const eventId = String(event?.id || "");
    const eventType = String(event?.event_type || "");

    if (!eventId) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Idempotency guard — duplicate deliveries are ignored.
    const { error: dupError } = await admin
      .from("provider_webhook_events")
      .insert({ provider: "paypal", event_id: eventId, event_type: eventType });

    if (dupError) {
      console.log("PayPal webhook: duplicate event ignored", { eventType });
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const resource = event?.resource ?? {};
    const subscriptionId: string | null =
      resource?.id?.toString?.().startsWith("I-") ? resource.id :
      resource?.billing_agreement_id || resource?.subscription_id || null;

    if (!subscriptionId) {
      console.log("PayPal webhook: no subscription reference", { eventType });
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const { data: sub } = await admin
      .from("subscriptions")
      .select("id, user_id, selected_plan")
      .eq("provider", "paypal")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle();

    if (!sub) {
      console.log("PayPal webhook: subscription not found locally", { eventType });
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let profileUpdates: Record<string, unknown> | null = null;

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        updates.subscription_status = "pending";
        break;
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
        updates.subscription_status = "trialing";
        updates.cancellation_status = "none";
        profileUpdates = { subscription_plan: sub.selected_plan, payment_status: "trialing" };
        break;
      case "PAYMENT.SALE.COMPLETED":
        updates.subscription_status = "active";
        if (resource?.billing_info?.next_billing_time) {
          updates.renewal_date = new Date(resource.billing_info.next_billing_time).toISOString();
        }
        profileUpdates = {
          subscription_plan: sub.selected_plan,
          trial_active: false,
          payment_status: "complete",
        };
        break;
      case "PAYMENT.SALE.DENIED":
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        updates.subscription_status = "payment_failed";
        profileUpdates = { payment_status: "failed" };
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        updates.subscription_status = "cancelled";
        updates.cancellation_status = "cancelled";
        updates.cancelled_at = new Date().toISOString();
        profileUpdates = { subscription_plan: "free", trial_active: false, payment_status: "cancelled" };
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        updates.subscription_status = "suspended";
        profileUpdates = { payment_status: "suspended" };
        break;
      case "BILLING.SUBSCRIPTION.EXPIRED":
        updates.subscription_status = "expired";
        profileUpdates = { subscription_plan: "free", trial_active: false, payment_status: "expired" };
        break;
      default:
        console.log("PayPal webhook: unhandled event", { eventType });
        return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const { error: updErr } = await admin.from("subscriptions").update(updates).eq("id", sub.id);
    if (updErr) console.error("PayPal webhook: subscription update failed");

    if (profileUpdates) {
      const { error: profErr } = await admin
        .from("profiles")
        .update(profileUpdates)
        .eq("user_id", sub.user_id);
      if (profErr) console.error("PayPal webhook: profile update failed");
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("PayPal webhook error:", error instanceof Error ? error.message : "unknown");
    return new Response("ERROR", { status: 500, headers: corsHeaders });
  }
});
