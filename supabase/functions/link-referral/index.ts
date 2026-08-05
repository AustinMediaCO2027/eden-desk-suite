import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const code = typeof body?.affiliate_code === "string" ? body.affiliate_code.trim() : "";
    if (!code || code.length > 64 || !/^[A-Za-z0-9_-]+$/.test(code)) {
      return json({ error: "Invalid affiliate code" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("referred_by_affiliate_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.referred_by_affiliate_id) {
      return json({ skipped: true, reason: "Already linked" });
    }

    const { data: affiliate } = await admin
      .from("affiliates")
      .select("id, user_id")
      .eq("affiliate_code", code)
      .eq("status", "approved")
      .maybeSingle();

    if (!affiliate) return json({ error: "Invalid affiliate code" }, 400);
    if (affiliate.user_id === user.id) {
      return json({ skipped: true, reason: "Self-referral blocked" });
    }

    const { data: existing } = await admin
      .from("referrals")
      .select("id")
      .eq("affiliate_id", affiliate.id)
      .eq("referred_user_id", user.id)
      .maybeSingle();

    if (existing) return json({ skipped: true, reason: "Referral already exists" });

    await admin
      .from("profiles")
      .update({ referred_by_affiliate_id: affiliate.id })
      .eq("user_id", user.id);

    await admin.from("referrals").insert({
      affiliate_id: affiliate.id,
      referred_user_id: user.id,
      subscription_plan: "",
      is_active: true,
    });

    return json({ success: true });
  } catch (_err) {
    return json({ error: "Server error" }, 500);
  }
});
