import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_PRICES: Record<string, number> = {
  standard: 49.99,
  silver: 85.99,
  premium: 99.99,
  yearly: 985,
};

const COMMISSION_RATE = 0.25; // 25%

const MAX_COMMISSIONS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Internal-only endpoint: caller MUST present the service role key.
    // Regular user JWTs are rejected so commissions cannot be fabricated.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!token || token !== serviceKey) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const { user_id, plan } = await req.json();
    if (!user_id || !plan) {
      return new Response(JSON.stringify({ error: "Missing user_id or plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (plan === "trial" || plan === "free") {
      return new Response(JSON.stringify({ skipped: true, reason: "No commission for trial/free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for data operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user has a referrer
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by_affiliate_id")
      .eq("user_id", user_id)
      .single();

    if (!profile?.referred_by_affiliate_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "No referrer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const affiliateId = profile.referred_by_affiliate_id;

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, user_id, pending_balance, total_earnings")
      .eq("id", affiliateId)
      .eq("status", "approved")
      .single();

    if (!affiliate) {
      return new Response(JSON.stringify({ skipped: true, reason: "Affiliate not approved" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (affiliate.user_id === user_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "Self-referral blocked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: referral } = await supabase
      .from("referrals")
      .select("id, commissions_paid, commission_expiry_date, subscription_start_date")
      .eq("affiliate_id", affiliateId)
      .eq("referred_user_id", user_id)
      .single();

    if (!referral) {
      return new Response(JSON.stringify({ skipped: true, reason: "No referral record" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commissionsPaid = referral.commissions_paid || 0;
    if (commissionsPaid >= MAX_COMMISSIONS) {
      return new Response(JSON.stringify({ skipped: true, reason: "Commission limit reached (3 months)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (referral.commission_expiry_date && new Date(referral.commission_expiry_date) < new Date()) {
      return new Response(JSON.stringify({ skipped: true, reason: "Commission window expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planPrice = PLAN_PRICES[plan] || 49.99;
    const amount = Math.round(planPrice * COMMISSION_RATE * 100) / 100;
    const now = new Date();

    const updateData: Record<string, any> = {
      subscription_plan: plan,
      is_active: true,
      commissions_paid: commissionsPaid + 1,
    };

    if (!referral.subscription_start_date) {
      updateData.subscription_start_date = now.toISOString();
      const expiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      updateData.commission_expiry_date = expiry.toISOString();
    }

    await supabase
      .from("referrals")
      .update(updateData)
      .eq("id", referral.id);

    await supabase.from("commissions").insert({
      affiliate_id: affiliateId,
      referral_id: referral.id,
      plan,
      amount,
      billing_cycle: plan === "yearly" ? "yearly" : "monthly",
      status: "pending",
    });

    await supabase
      .from("affiliates")
      .update({
        pending_balance: (affiliate.pending_balance || 0) + amount,
        total_earnings: (affiliate.total_earnings || 0) + amount,
      })
      .eq("id", affiliateId);

    return new Response(JSON.stringify({ success: true, amount, commissions_remaining: MAX_COMMISSIONS - commissionsPaid - 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
