import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    // Tokens are 32-char hex (UUID without dashes). Reject anything else early.
    if (!token || token.length < 16 || token.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
      return json({ status: "revoked" }, 404);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: file, error } = await admin
      .from("user_files")
      .select("file_name, file_type, file_size, share_expiry, storage_path")
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("shared-file lookup failed", error.message);
      return json({ error: "Unable to load file" }, 500);
    }

    if (!file) return json({ status: "revoked" }, 404);

    if (!file.share_expiry || new Date(file.share_expiry) < new Date()) {
      return json({ status: "expired" }, 410);
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, 3600);

    if (signErr || !signed?.signedUrl) {
      console.error("shared-file signing failed", signErr?.message);
      return json({ error: "Unable to load file" }, 500);
    }

    return json({
      status: "ok",
      file: {
        file_name: file.file_name,
        file_type: file.file_type,
        file_size: file.file_size,
        share_expiry: file.share_expiry,
      },
      url: signed.signedUrl,
    });
  } catch (e) {
    console.error("shared-file error", e instanceof Error ? e.message : e);
    return json({ error: "Unable to load file" }, 500);
  }
});
