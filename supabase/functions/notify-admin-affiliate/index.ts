import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.applicant_email === "string" ? body.applicant_email.trim().toLowerCase() : "";

    if (!rawEmail || rawEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return new Response(JSON.stringify({ error: "Invalid applicant data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Only notify for a real, recently-submitted pending application.
    // All content below comes from the stored row, never from the request body.
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: application } = await supabaseAdmin
      .from("affiliates")
      .select("full_name, email, country, promotion_method, created_at")
      .ilike("email", rawEmail)
      .eq("status", "pending")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!application) {
      return new Response(JSON.stringify({ error: "No matching application" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const escapeHtml = (v: unknown) =>
      String(v ?? "")
        .slice(0, 200)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const applicant_name = escapeHtml(application.full_name);
    const applicant_email = escapeHtml(application.email);
    const applicant_country = escapeHtml(application.country);
    const promotion_method = escapeHtml(application.promotion_method);


    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError || !adminRoles?.length) {
      console.error("No admins found or error:", rolesError);
      return new Response(JSON.stringify({ error: "No admins found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserIds = adminRoles.map((r: any) => r.user_id);

    // Insert in-app notifications for each admin
    const notifications = adminUserIds.map((userId: string) => ({
      user_id: userId,
      title: "New Affiliate Application",
      message: `${applicant_name} (${applicant_email}) from ${applicant_country || "Unknown"} has applied to the affiliate program.`,
      type: "affiliate_application",
      link: "/dashboard/admin/affiliates",
    }));

    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert(notifications);

    if (notifError) {
      console.error("Failed to insert notifications:", notifError);
    }

    // Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const userId of adminUserIds) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    // Send email notification via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "hello@eden-desk.com";

    if (resendApiKey && adminEmails.length > 0) {
      const emailHtml = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 20px; font-weight: 700; color: #111; margin: 0;">New Affiliate Application</h1>
          </div>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #666; width: 120px;">Name</td>
                <td style="padding: 8px 0; font-size: 13px; color: #111; font-weight: 600;">${applicant_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #666;">Email</td>
                <td style="padding: 8px 0; font-size: 13px; color: #111; font-weight: 600;">${applicant_email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #666;">Country</td>
                <td style="padding: 8px 0; font-size: 13px; color: #111; font-weight: 600;">${applicant_country || "Not specified"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #666;">Method</td>
                <td style="padding: 8px 0; font-size: 13px; color: #111; font-weight: 600;">${promotion_method || "Not specified"}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center;">
            <a href="https://eden-desk-suite.lovable.app/dashboard/admin/affiliates"
               style="display: inline-block; padding: 12px 28px; background: #0066FF; color: #fff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
              Review Application
            </a>
          </div>
          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 32px;">
            Eden Desk — Affiliate Program
          </p>
        </div>
      `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: adminEmails,
            subject: `New Affiliate Application: ${applicant_name}`,
            html: emailHtml,
          }),
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error("Resend error:", errText);
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-admin-affiliate error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
