import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/js-md5@0.8.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYFAST_PLAN_PRICES: Record<string, number> = {
  standard: 29.99,
  silver: 49.99,
  premium: 99.99,
};

const TRIAL_MONTHS = 3;

const addMonths = (date: Date, months: number) => {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
};

const encodePayFastValue = (value: string) =>
  encodeURIComponent(value.trim()).replace(/%20/g, "+");

const buildSignaturePayload = (params: URLSearchParams, passphrase?: string) => {
  const entries = Array.from(params.entries())
    .filter(([key, value]) => key !== "signature" && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  const paramString = entries
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");

  const phrase = passphrase?.trim();
  return phrase
    ? `${paramString}&passphrase=${encodePayFastValue(phrase)}`
    : paramString;
};

const validatePayFastSignature = (params: URLSearchParams, passphrase?: string) => {
  const received = (params.get("signature") || "").trim().toLowerCase();
  if (!received) return false;
  const generated = md5(buildSignaturePayload(params, passphrase)).toLowerCase();
  return received === generated;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || "";

    if (!validatePayFastSignature(params, passphrase)) {
      console.error("Invalid PayFast signature", { userId: params.get("custom_str1"), planId: params.get("custom_str2") });
      return new Response("INVALID_SIGNATURE", { status: 200, headers: corsHeaders });
    }

    const paymentStatus = (params.get("payment_status") || "").toUpperCase();
    const userId = params.get("custom_str1");
    const planId = params.get("custom_str2");
    const country = params.get("custom_str4") || "ZA";
    const pfToken = params.get("token") || "";
    const pfPaymentId = params.get("pf_payment_id") || "";
    const mPaymentId = params.get("m_payment_id") || "";
    const pfSubscriptionId = pfToken || pfPaymentId || mPaymentId;

    if (!userId || !planId) {
      console.error("Missing userId or planId in ITN");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency guard — PayFast can retry the same ITN multiple times.
    const eventKey = `${mPaymentId || pfSubscriptionId}:${pfPaymentId || paymentStatus}:${paymentStatus}`;
    const { error: dupError } = await supabase
      .from("provider_webhook_events")
      .insert({ provider: "payfast", event_id: eventKey, event_type: paymentStatus });

    if (dupError) {
      console.log("Duplicate PayFast ITN ignored");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const isSubscriptionPlan = planId in PAYFAST_PLAN_PRICES;

    if (paymentStatus === "CANCELLED") {
      if (isSubscriptionPlan) {
        await supabase
          .from("subscriptions")
          .update({
            subscription_status: "cancelled",
            cancellation_status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("provider", "payfast")
          .eq("user_id", userId);

        await supabase
          .from("profiles")
          .update({ subscription_plan: "free", trial_active: false, payment_status: "cancelled" })
          .eq("user_id", userId);
      }
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    if (paymentStatus === "FAILED") {
      await supabase
        .from("subscriptions")
        .update({ subscription_status: "payment_failed" })
        .eq("provider", "payfast")
        .eq("user_id", userId);
      await supabase
        .from("profiles")
        .update({ payment_status: "failed" })
        .eq("user_id", userId);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    if (paymentStatus !== "COMPLETE") {
      console.log("Payment not complete", { paymentStatus, userId, planId });
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    if (planId.startsWith("storage-")) {
      const storageMap: Record<string, number> = {
        "storage-5gb": 5 * 1024 * 1024 * 1024,
        "storage-10gb": 10 * 1024 * 1024 * 1024,
        "storage-30gb": 30 * 1024 * 1024 * 1024,
      };
      const addOnBytes = storageMap[planId] || 0;

      if (addOnBytes > 0) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("add_on_storage")
          .eq("user_id", userId)
          .single();

        const { error } = await supabase
          .from("profiles")
          .update({
            add_on_storage: (profile?.add_on_storage || 0) + addOnBytes,
            payment_status: "complete",
            payfast_subscription_id: pfSubscriptionId,
            payfast_token: pfToken,
          })
          .eq("user_id", userId);

        if (error) console.error("Error updating storage add-on:", error);
      }
    } else if (planId === "trial") {
      const trialEndIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_plan: "trial",
          trial_active: true,
          trial_ends_at: trialEndIso,
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndIso,
          trial_used: true,
          payfast_subscription_id: pfSubscriptionId,
          payfast_token: pfToken,
          payment_status: "complete",
        })
        .eq("user_id", userId)
        .eq("trial_used", false);

      if (error) {
        console.error("Error activating trial:", error);
      } else {
        console.log(`Trial activated for user ${userId}`);
      }
    } else if (isSubscriptionPlan) {
      // Subscription set-up (R0.00 today) or a post-trial recurring payment.
      const grossAmount = Number(params.get("amount_gross") || "0");
      const isSetup = !Number.isFinite(grossAmount) || grossAmount <= 0;

      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, trial_start_date, trial_end_date")
        .eq("provider", "payfast")
        .eq("user_id", userId)
        .eq("selected_plan", planId)
        .maybeSingle();

      const now = new Date();
      const trialStart = isSetup
        ? now
        : existing?.trial_start_date
          ? new Date(existing.trial_start_date)
          : now;
      const trialEnd = existing?.trial_end_date && !isSetup
        ? new Date(existing.trial_end_date)
        : addMonths(trialStart, TRIAL_MONTHS);
      const renewal = isSetup ? trialEnd : addMonths(now, 1);

      const record = {
        user_id: userId,
        provider: "payfast",
        selected_plan: planId,
        country: country.toUpperCase(),
        currency: "ZAR",
        recurring_price: PAYFAST_PLAN_PRICES[planId],
        trial_start_date: trialStart.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        billing_start_date: trialEnd.toISOString(),
        renewal_date: renewal.toISOString(),
        subscription_status: isSetup ? "trialing" : "active",
        cancellation_status: "none",
        provider_plan_id: planId,
        provider_subscription_id: pfSubscriptionId || null,
        provider_reference: mPaymentId || pfPaymentId || null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase.from("subscriptions").update(record).eq("id", existing.id);
        if (error) console.error("Error updating PayFast subscription record:", error);
      } else {
        const { error } = await supabase.from("subscriptions").insert(record);
        if (error) console.error("Error inserting PayFast subscription record:", error);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_plan: planId,
          trial_active: isSetup,
          trial_used: true,
          trial_start_date: trialStart.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          billing_country: country.toUpperCase(),
          payfast_subscription_id: pfSubscriptionId,
          payfast_token: pfToken,
          payment_status: isSetup ? "trialing" : "complete",
        })
        .eq("user_id", userId);

      if (profileError) console.error("Error updating subscription profile:", profileError);
    } else {
      const validPlans = ["yearly"];
      if (validPlans.includes(planId)) {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_plan: planId,
            trial_active: false,
            payfast_subscription_id: pfSubscriptionId,
            payfast_token: pfToken,
            payment_status: "complete",
          })
          .eq("user_id", userId);

        if (error) console.error("Error updating subscription:", error);
      }
    }

    // Process commission for referred users on successful billing
    try {
      if (planId !== "trial" && planId !== "free") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("referred_by_affiliate_id")
          .eq("user_id", userId)
          .single();

        if (profile?.referred_by_affiliate_id) {
          console.log("Processing commission for referral", { userId, planId, affiliateId: profile.referred_by_affiliate_id });

          const commissionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-commission`;
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

          const commResp = await fetch(commissionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              user_id: userId,
              plan: planId,
            }),
          });

          const commResult = await commResp.text();
          console.log("Commission result:", commResult);
        }
      }
    } catch (commErr) {
      console.error("Commission processing error (non-fatal):", commErr);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("ITN processing error:", error);
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
