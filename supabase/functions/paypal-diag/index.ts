import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getPayPalAccessToken, paypalApiBase, PAYPAL_PLAN_IDS } from "../_shared/paypal.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const out: Record<string, unknown> = {};
  try {
    const token = await getPayPalAccessToken();
    for (const [plan, id] of Object.entries(PAYPAL_PLAN_IDS)) {
      const res = await fetch(`${paypalApiBase()}/v1/billing/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : null;
      out[plan] = { status: res.status, planStatus: data?.status ?? null };
    }
  } catch (e) {
    out.error = e instanceof Error ? e.message : "unknown";
  }

  return new Response(JSON.stringify(out), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
