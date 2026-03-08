import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

async function md5(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("MD5", data);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hash)));
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const formatAmount = (value: unknown, fallback: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : fallback;
};

// Match PHP urlencode exactly: encode everything except A-Za-z0-9 -_.
// encodeURIComponent doesn't encode !'()*~ but PHP urlencode does.
const encodePayFastValue = (value: string) =>
  encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const generatePayFastSignature = async (params: Record<string, string>, passphrase?: string): Promise<string> => {
  // PayFast requires params in their natural order, NOT sorted alphabetically
  const payload = Object.entries(params)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");

  const phrase = passphrase?.trim();
  const fullPayload = phrase
    ? `${payload}&passphrase=${encodePayFastValue(phrase)}`
    : payload;

  return await md5(fullPayload);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PAYFAST_MERCHANT_ID = Deno.env.get("PAYFAST_MERCHANT_ID");
    const PAYFAST_MERCHANT_KEY = Deno.env.get("PAYFAST_MERCHANT_KEY");
    const PAYFAST_PASSPHRASE = Deno.env.get("PAYFAST_PASSPHRASE") || "";

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      return new Response(JSON.stringify({ error: "PayFast merchant credentials are not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      planName,
      planId,
      amount,
      period,
      userEmail,
      userId,
      companyName,
      isTrial,
      returnUrl,
      cancelUrl,
      trialRecurringAmount,
    } = body ?? {};

    if (!userId || user.id !== userId) {
      return new Response(JSON.stringify({ error: "Invalid checkout user context" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (isTrial) {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("trial_used")
        .eq("user_id", userId)
        .single();

      if (profile?.trial_used) {
        return new Response(JSON.stringify({ error: "Trial already used" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const paymentAmount = isTrial ? "0.00" : formatAmount(amount, "0.00");
    const recurringAmount = isTrial
      ? formatAmount(trialRecurringAmount, "39.99")
      : formatAmount(amount, "0.00");

    const params: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: returnUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=success`,
      cancel_url: cancelUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=cancelled`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-itn`,
      name_first: companyName || userEmail?.split("@")[0] || "Eden Desk",
      email_address: userEmail || user.email || "",
      amount: paymentAmount,
      item_name: isTrial ? "Starter Plan Trial" : `Eden Desk ${planName} Plan`,
      item_description: isTrial
        ? `7-day trial (R0.00 today), then R${recurringAmount} monthly`
        : `${planName} subscription - ${period}`,
      custom_str1: userId,
      custom_str2: isTrial ? "trial" : (planId || ""),
      m_payment_id: `${userId}:${isTrial ? "trial" : planId}:${Date.now()}`,
      subscription_type: "1",
      recurring_amount: recurringAmount,
      frequency: isTrial ? "3" : (planId === "yearly" ? "6" : "3"),
      cycles: "0",
    };

    params.signature = await generatePayFastSignature(params, PAYFAST_PASSPHRASE);

    return new Response(
      JSON.stringify({
        paymentUrl: "https://www.payfast.co.za/eng/process",
        openInNewTab: true,
        params,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PayFast error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
