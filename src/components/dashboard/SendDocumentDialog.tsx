import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Mail, ExternalLink } from "lucide-react";

interface SendDocumentDialogProps {
  type: "invoice" | "quote";
  documentNumber: string;
  clientEmail: string;
  clientName: string;
  total: number;
  items: any[];
  taxRate: number;
  date?: string;
  dueDate?: string;
  notes?: string;
  profile: Profile | null;
  onClose: () => void;
}

const SendDocumentDialog = ({
  type,
  documentNumber,
  clientEmail,
  clientName,
  total,
  items,
  taxRate,
  date,
  dueDate,
  notes,
  profile,
  onClose,
}: SendDocumentDialogProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(clientEmail);
  const [subject, setSubject] = useState(
    `${type === "invoice" ? "Invoice" : "Quote"} ${documentNumber} from ${profile?.company_name || "us"}`
  );
  const [message, setMessage] = useState(
    `Hi ${clientName},\n\nPlease find attached ${type === "invoice" ? "invoice" : "quote"} ${documentNumber} for R${total.toFixed(2)}.\n\nKind regards,\n${profile?.company_name || ""}`
  );

  const handleSendViaEmail = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      const brandColor = profile?.brand_color || "#2563EB";
      const { subtotal, taxAmount } = (() => {
        const sub = items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
        const tax = sub * (taxRate / 100);
        return { subtotal: sub, taxAmount: tax };
      })();

      const itemRowsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px;">${item.description || ""}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: right;">R${Number(item.rate).toFixed(2)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: right; font-weight: 600;">R${Number(item.amount).toFixed(2)}</td>
        </tr>
      `).join("");

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: ${brandColor}; padding: 24px; border-radius: 8px 8px 0 0;">
            ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 8px;" />` : ""}
            <h2 style="color: white; margin: 0; font-size: 20px;">${type === "invoice" ? "Invoice" : "Quote"} ${documentNumber}</h2>
            ${profile?.company_name ? `<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">${profile.company_name}</p>` : ""}
          </div>

          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <!-- From / To -->
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="vertical-align: top; width: 50%;">
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">From</p>
                  ${profile?.company_name ? `<p style="font-size: 13px; color: #374151; margin: 2px 0; font-weight: 600;">${profile.company_name}</p>` : ""}
                  ${profile?.company_email ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0;">${profile.company_email}</p>` : ""}
                  ${profile?.company_phone ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0;">${profile.company_phone}</p>` : ""}
                  ${profile?.company_address ? `<p style="font-size: 12px; color: #6b7280; margin: 2px 0;">${profile.company_address}</p>` : ""}
                </td>
                <td style="vertical-align: top; width: 50%;">
                  <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">To</p>
                  <p style="font-size: 13px; color: #374151; margin: 2px 0; font-weight: 600;">${clientName}</p>
                  <p style="font-size: 12px; color: #6b7280; margin: 2px 0;">${email}</p>
                </td>
              </tr>
            </table>

            <!-- Date & Document Info -->
            <table style="width: 100%; margin-bottom: 20px; font-size: 13px;">
              <tr><td style="color: #6b7280; padding: 2px 0;">Document #</td><td style="text-align: right; font-weight: 600; color: #374151;">${documentNumber}</td></tr>
              <tr><td style="color: #6b7280; padding: 2px 0;">Date</td><td style="text-align: right; color: #374151;">${date || new Date().toISOString().split("T")[0]}</td></tr>
              ${type === "invoice" && dueDate ? `<tr><td style="color: #6b7280; padding: 2px 0;">Due Date</td><td style="text-align: right; color: #374151;">${dueDate}</td></tr>` : ""}
            </table>

            <!-- Message -->
            <p style="white-space: pre-line; color: #374151; line-height: 1.6; font-size: 14px; margin-bottom: 20px;">${message}</p>

            <!-- Line Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Description</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Rate</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
              <tr><td style="color: #6b7280; padding: 4px 0;">Subtotal</td><td style="text-align: right; color: #374151;">R${subtotal.toFixed(2)}</td></tr>
              <tr><td style="color: #6b7280; padding: 4px 0;">Tax (${taxRate}%)</td><td style="text-align: right; color: #374151;">R${taxAmount.toFixed(2)}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 2px solid ${brandColor}; color: #111827;">Total</td><td style="text-align: right; padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 2px solid ${brandColor}; color: ${brandColor};">R${total.toFixed(2)}</td></tr>
            </table>

            <!-- Banking Details -->
            ${type === "invoice" && profile?.bank_name ? `
              <div style="margin-top: 8px; padding: 16px; background: #f9fafb; border-radius: 6px; border-left: 3px solid ${brandColor};">
                <p style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Banking Details</p>
                <table style="font-size: 13px; color: #374151;">
                  <tr><td style="padding: 2px 12px 2px 0; color: #6b7280;">Bank:</td><td>${profile.bank_name}</td></tr>
                  <tr><td style="padding: 2px 12px 2px 0; color: #6b7280;">Account Holder:</td><td>${profile.bank_account_holder}</td></tr>
                  <tr><td style="padding: 2px 12px 2px 0; color: #6b7280;">Account Number:</td><td>${profile.bank_account_number}</td></tr>
                  <tr><td style="padding: 2px 12px 2px 0; color: #6b7280;">Branch Code:</td><td>${profile.bank_branch_code}</td></tr>
                  ${profile.bank_account_type ? `<tr><td style="padding: 2px 12px 2px 0; color: #6b7280;">Account Type:</td><td>${profile.bank_account_type}</td></tr>` : ""}
                </table>
              </div>
            ` : ""}

            <!-- Notes -->
            ${notes ? `
              <div style="margin-top: 16px; padding: 12px; background: #fffbeb; border-radius: 6px;">
                <p style="font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; margin: 0 0 4px;">Notes</p>
                <p style="font-size: 13px; color: #92400e; margin: 0; white-space: pre-line;">${notes}</p>
              </div>
            ` : ""}
          </div>
          <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px;">Sent via Eden Desk</p>
        </div>
      `;

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject,
          html,
          from_name: profile?.company_name || "Eden Desk",
          from_email: profile?.company_email || undefined,
        },
      });

      if (error || data?.error) {
        // If email service not configured, offer mailto fallback
        if (data?.error === "Email service not configured") {
          toast({
            title: "Email service not configured",
            description: "Opening your email client instead. Add a RESEND_API_KEY in secrets for direct sending.",
          });
          openMailto();
          onClose();
          return;
        }
        throw new Error(data?.error || error?.message || "Failed to send");
      }

      toast({ title: "Email sent!", description: `${type === "invoice" ? "Invoice" : "Quote"} sent to ${email}` });
      onClose();
    } catch (err: any) {
      // Fallback to mailto
      toast({
        title: "Couldn't send directly",
        description: "Opening your email client instead.",
      });
      openMailto();
      onClose();
    } finally {
      setSending(false);
    }
  };

  const openMailto = () => {
    const body = encodeURIComponent(message);
    const subj = encodeURIComponent(subject);
    window.open(`mailto:${email}?subject=${subj}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Send {type === "invoice" ? "Invoice" : "Quote"}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-secondary"
              rows={5}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSendViaEmail} disabled={sending || !email} className="flex-1">
            <Send className="h-4 w-4 mr-1" />
            {sending ? "Sending..." : "Send Email"}
          </Button>
          <Button variant="outline" onClick={openMailto}>
            <ExternalLink className="h-4 w-4 mr-1" /> Open Email App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendDocumentDialog;
