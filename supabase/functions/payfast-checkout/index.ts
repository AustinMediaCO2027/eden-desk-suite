import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

type PayFastPair = [string, string];

const PAYFAST_SIGNATURE_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "email_confirmation",
  "confirmation_address",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
  "subscription_notify_email",
  "subscription_notify_webhook",
  "subscription_notify_buyer",
] as const;

async function md5(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("MD5", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const formatAmount = (value: unknown, fallback: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : fallback;
};

const formatBillingDate = (daysFromNow = 0) => {
  const target = new Date();
  target.setDate(target.getDate() + daysFromNow);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateOnly = (target: Date) => {
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addMonthsUtc = (date: Date, months: number) => {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
};


const sanitizePaymentReference = (value: string) =>
  value
    .replace(/[^A-Za-z0-9\-_\/]/g, "_")
    .slice(0, 100);

// Match PHP urlencode exactly: encode everything except A-Za-z0-9 -_.
const encodePayFastValue = (value: string) =>
  encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const toOrderedPayFastPairs = (params: Record<string, string | null | undefined>): PayFastPair[] => {
  const keySet = new Set(PAYFAST_SIGNATURE_ORDER);

  const orderedPairs: PayFastPair[] = PAYFAST_SIGNATURE_ORDER.flatMap((key) => {
    const value = params[key];
    return value === undefined || value === null || value === "" ? [] : [[key, value]];
  });

  for (const [key, value] of Object.entries(params)) {
    if (keySet.has(key as typeof PAYFAST_SIGNATURE_ORDER[number])) {
      continue;
    }

    if (value !== undefined && value !== null && value !== "") {
      orderedPairs.push([key, value]);
    }
  }

  return orderedPairs;
};

const generatePayFastSignature = async (pairs: PayFastPair[], passphrase?: string): Promise<string> => {
  const payload = pairs
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join("&");

  const phrase = passphrase?.trim();
  const fullPayload = phrase
    ? `${payload}&passphrase=${encodePayFastValue(phrase)}`
    : payload;

  return md5(fullPayload);
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
    const PAYFAST_PROCESS_URL_OVERRIDE = Deno.env.get("PAYFAST_PROCESS_URL")?.trim();

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      return new Response(JSON.stringify({ error: "PayFast merchant credentials are not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSandboxMerchant = PAYFAST_MERCHANT_ID === "10000100";
    const paymentUrl = PAYFAST_PROCESS_URL_OVERRIDE || (isSandboxMerchant
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process");

    console.log("PayFast checkout config", {
      paymentUrl,
      merchantIdLength: PAYFAST_MERCHANT_ID.length,
      merchantIdPrefix: PAYFAST_MERCHANT_ID.slice(0, 4),
      merchantIdSuffix: PAYFAST_MERCHANT_ID.slice(-2),
      merchantKeyLength: PAYFAST_MERCHANT_KEY.length,
      merchantKeyPrefix: PAYFAST_MERCHANT_KEY.slice(0, 4),
      merchantKeySuffix: PAYFAST_MERCHANT_KEY.slice(-2),
      usingPassphrase: Boolean(PAYFAST_PASSPHRASE.trim()),
    });

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
      country,
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

    // Server-side source of truth for South African subscription pricing (ZAR).
    const PAYFAST_PLAN_PRICES: Record<string, number> = {
      standard: 29.99,
      silver: 49.99,
      premium: 99.99,
    };

    // Subscription plans always start with a 3-month free trial (R0.00 today).
    const isSubscriptionPlan = typeof planId === "string" && planId in PAYFAST_PLAN_PRICES;
    const TRIAL_MONTHS = 3;

    if (isTrial || isSubscriptionPlan) {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("trial_used")
        .eq("user_id", userId)
        .single();

      if (profile?.trial_used && isTrial) {
        return new Response(JSON.stringify({ error: "Trial already used" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Some issuers reject R0.00 (zero value) card authorisations with a generic
    // processing error. PAYFAST_TRIAL_INITIAL_AMOUNT allows switching the trial
    // set-up charge to a small verification amount without a code change.
    const rawTrialInitial = (Deno.env.get("PAYFAST_TRIAL_INITIAL_AMOUNT") || "0.00").trim();
    const parsedTrialInitial = Number(rawTrialInitial);
    const trialInitialAmount = Number.isFinite(parsedTrialInitial) && parsedTrialInitial > 0
      ? parsedTrialInitial.toFixed(2)
      : "0.00";

    const paymentAmount = isSubscriptionPlan || isTrial
      ? trialInitialAmount
      : formatAmount(amount, "0.00");
    const recurringAmount = isSubscriptionPlan
      ? PAYFAST_PLAN_PRICES[planId as string].toFixed(2)
      : isTrial
        ? formatAmount(trialRecurringAmount, "39.99")
        : formatAmount(amount, "0.00");




    const passphrase = PAYFAST_PASSPHRASE.trim();
    if (!passphrase) {
      return new Response(JSON.stringify({ error: "PayFast passphrase is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PayFast rejects localhost / relative URLs, so fall back to the live site.
    const PUBLIC_SITE_URL = (Deno.env.get("PUBLIC_SITE_URL") || "https://eden-desk.com").replace(/\/$/, "");
    const isUsableUrl = (value: string) => {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:") return false;
        return !/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(url.hostname);
      } catch {
        return false;
      }
    };
    const rawOrigin = (req.headers.get("origin") || "").trim().replace(/\/$/, "");
    const origin = isUsableUrl(rawOrigin) ? rawOrigin : PUBLIC_SITE_URL;
    const safeUrl = (candidate: string | undefined, fallback: string) => {
      const value = (candidate || "").trim();
      return isUsableUrl(value) ? value : fallback;
    };
    const normalizedEmail = (userEmail || user.email || "").trim();

    if (!normalizedEmail) {
      return new Response(JSON.stringify({ error: "A valid email address is required for PayFast checkout" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedCompanyName = (companyName || "").trim();
    const fallbackName = normalizedEmail.split("@")[0] || "Customer";
    const [firstNameRaw, ...lastNameParts] = (trimmedCompanyName || fallbackName).split(/\s+/);
    // PayFast / acquirer descriptors only accept plain latin text.
    const sanitizeText = (value: string, max: number) =>
      value
        .normalize("NFKD")
        .replace(/[^A-Za-z0-9 .\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, max);
    const firstName = sanitizeText(firstNameRaw || "Customer", 100) || "Customer";
    const lastName = sanitizeText(lastNameParts.join(" ") || "Customer", 100) || "Customer";

    // Keep the merchant reference short and strictly alphanumeric.
    const rawReference = `${userId.replace(/-/g, "").slice(0, 12)}-${isTrial ? "trial" : (planId || "plan")}-${Date.now().toString(36)}`;
    const trialStart = new Date();
    const trialEnd = addMonthsUtc(trialStart, TRIAL_MONTHS);
    const billingDate = isSubscriptionPlan
      ? formatDateOnly(trialEnd)
      : formatBillingDate(isTrial ? 7 : 0);

    // Empty string means "let PayFast decide" (it already restricts recurring
    // billing to cards). Forcing "cc" makes some valid cards fail at the
    // acquirer with a generic processing error.
    const paymentMethodOverride = (Deno.env.get("PAYFAST_PAYMENT_METHOD") || "").trim().toLowerCase();

    const rawParams: Record<string, string | undefined> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: safeUrl(returnUrl, `${origin}/dashboard/billing?status=success`),
      cancel_url: safeUrl(cancelUrl, `${origin}/dashboard/billing?status=cancelled`),
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-itn`,
      name_first: firstName,
      name_last: lastName,
      email_address: normalizedEmail,
      m_payment_id: sanitizePaymentReference(rawReference),
      amount: paymentAmount,
      item_name: sanitizeText(isTrial ? "Starter Plan Trial" : `Eden Desk ${planName} Plan`, 100),
      item_description: sanitizeText(
        isSubscriptionPlan
          ? `3 month free trial then R${recurringAmount} per month`
          : isTrial
            ? `7 day trial then R${recurringAmount} per month`
            : `${planName} subscription ${period}`,
        255,
      ),
      custom_str1: userId,
      custom_str2: isTrial ? "trial" : (planId || ""),
      custom_str3: isSubscriptionPlan ? String(TRIAL_MONTHS) : undefined,
      custom_str4: country ? String(country).toUpperCase().substring(0, 10) : undefined,
      payment_method: paymentMethodOverride || undefined,
      subscription_type: "1",
      billing_date: billingDate,
      recurring_amount: recurringAmount,
      frequency: isTrial ? "3" : (planId === "yearly" ? "6" : "3"),

      cycles: "0",
      subscription_notify_email: "true",
      subscription_notify_webhook: "true",
      subscription_notify_buyer: "true",
    };


    const orderedPairs = toOrderedPayFastPairs(rawParams);
    const params = Object.fromEntries(orderedPairs) as Record<string, string>;
    params.signature = await generatePayFastSignature(orderedPairs, passphrase);

    return new Response(
      JSON.stringify({
        paymentUrl,
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
