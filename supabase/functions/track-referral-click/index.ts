import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { affiliate_code, visitor_id } = await req.json();
    if (!affiliate_code) {
      return new Response(JSON.stringify({ error: "Missing affiliate_code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliate_code)
      .eq("status", "approved")
      .single();

    if (!affiliate) {
      return new Response(JSON.stringify({ error: "Invalid affiliate" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record click
    await supabase.from("affiliate_clicks").insert({
      affiliate_id: affiliate.id,
      visitor_id: visitor_id || "",
      ip_hash: "",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
