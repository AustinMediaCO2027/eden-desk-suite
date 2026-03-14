import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/js-md5@0.8.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const paymentStatus = params.get("payment_status");
    const userId = params.get("custom_str1");
    const planId = params.get("custom_str2");
    const pfToken = params.get("token") || "";
    const pfSubscriptionId = params.get("pf_payment_id") || params.get("m_payment_id") || "";

    if (!userId || !planId) {
      console.error("Missing userId or planId in ITN");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    if (paymentStatus !== "COMPLETE") {
      console.log("Payment not complete", { paymentStatus, userId, planId });
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
    } else {
      const validPlans = ["standard", "silver", "premium", "yearly"];
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

          // Call process-commission with the correct field names it expects
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
