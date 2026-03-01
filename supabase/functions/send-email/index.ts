import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeHeaderValue = (value?: string | null) => (value || "").replace(/[\r\n]/g, "").trim();

const resolveFromAddress = (fromName?: string, fromEmail?: string) => {
  const senderName = sanitizeHeaderValue(fromName) || "Eden Desk";
  const preferredFromEmail = sanitizeHeaderValue(fromEmail);
  const configuredFromEmail = sanitizeHeaderValue(Deno.env.get("RESEND_FROM_EMAIL"));

  if (preferredFromEmail && emailRegex.test(preferredFromEmail)) {
    return `${senderName} <${preferredFromEmail}>`;
  }

  if (configuredFromEmail && emailRegex.test(configuredFromEmail)) {
    return `${senderName} <${configuredFromEmail}>`;
  }

  return "Eden Desk <onboarding@resend.dev>";
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

    const { to, subject, html, from_name, from_email, attachments } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured", 
          message: "Please add your RESEND_API_KEY in project secrets to enable email sending." 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resolvedFrom = resolveFromAddress(from_name, from_email);
    const emailPayload: Record<string, unknown> = {
      from: resolvedFrom,
      to: [to],
      subject,
      html,
    };

    // Keep reply-to aligned with company email when provided
    const replyToEmail = sanitizeHeaderValue(from_email);
    if (replyToEmail && emailRegex.test(replyToEmail)) {
      emailPayload.reply_to = replyToEmail;
    }

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailPayload.attachments = attachments.map((att: { filename: string; content: string; content_type?: string }) => {
        const mapped: Record<string, string> = {
          filename: att.filename,
          content: att.content,
        };
        if (att.content_type) mapped.type = att.content_type;
        return mapped;
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      const resendMessage =
        data?.message ||
        data?.error?.message ||
        data?.error ||
        "Failed to send email";

      const isSandboxRestriction =
        typeof resendMessage === "string" &&
        resendMessage.includes("You can only send testing emails to your own email address");

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          code: isSandboxRestriction ? "RESEND_SANDBOX_RESTRICTION" : "RESEND_SEND_FAILED",
          message: resendMessage,
          details: data,
        }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
