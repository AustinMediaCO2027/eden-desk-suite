import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PAYFAST_MERCHANT_ID = Deno.env.get("PAYFAST_MERCHANT_ID");
    const PAYFAST_MERCHANT_KEY = Deno.env.get("PAYFAST_MERCHANT_KEY");

    if (!PAYFAST_MERCHANT_ID) {
      return new Response(JSON.stringify({ error: "PAYFAST_MERCHANT_ID not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!PAYFAST_MERCHANT_KEY) {
      return new Response(JSON.stringify({ error: "PAYFAST_MERCHANT_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { planName, planId, amount, period, userEmail, userId, companyName, isTrial } = body;

    // For trial: check if already used
    if (isTrial) {
      const adminSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("trial_used")
        .eq("user_id", userId)
        .single();
      if (profile?.trial_used) {
        return new Response(JSON.stringify({ error: "Trial already used" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const params: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: body.returnUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=success`,
      cancel_url: body.cancelUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=cancelled`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-itn`,
      name_first: companyName || userEmail?.split("@")[0] || "",
      email_address: userEmail || "",
      amount: isTrial ? "0.00" : amount,
      item_name: isTrial ? "Eden Desk Starter Plan Trial" : `Eden Desk ${planName} Plan`,
      item_description: isTrial ? "7-Day Free Trial - Monthly recurring" : `${planName} subscription - ${period}`,
      custom_str1: userId || "",
      custom_str2: isTrial ? "trial" : (planId || ""),
      subscription_type: "1",
      recurring_amount: isTrial ? "0.00" : amount,
      frequency: isTrial ? "3" : (planId === "yearly" ? "6" : "3"),
      cycles: isTrial ? "0" : "0",
    };

    return new Response(JSON.stringify({
      paymentUrl: "https://www.payfast.co.za/eng/process",
      openInNewTab: true,
      params,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PayFast error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
