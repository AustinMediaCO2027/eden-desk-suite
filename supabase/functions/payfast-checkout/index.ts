import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { planName, planId, amount, period, userEmail, userId, companyName } = body;

    // Build PayFast payment parameters
    const params: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: body.returnUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=success`,
      cancel_url: body.cancelUrl || `${req.headers.get("origin") || ""}/dashboard/billing?status=cancelled`,
      notify_url: body.notifyUrl || `${req.headers.get("origin") || ""}/dashboard/billing`,
      name_first: companyName || userEmail?.split("@")[0] || "",
      email_address: userEmail || "",
      amount: amount,
      item_name: `Eden Desk ${planName} Plan`,
      item_description: `${planName} subscription - ${period}`,
      custom_str1: userId || "",
      custom_str2: planId || "",
      subscription_type: "1",
      recurring_amount: amount,
      frequency: planId === "yearly" ? "6" : "3",
      cycles: "0",
    };

    return new Response(JSON.stringify({
      paymentUrl: "https://www.payfast.co.za/eng/process",
      params,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PayFast error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
