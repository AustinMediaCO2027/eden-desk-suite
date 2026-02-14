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
  profile: Profile | null;
  onClose: () => void;
}

const SendDocumentDialog = ({
  type,
  documentNumber,
  clientEmail,
  clientName,
  total,
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
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${profile?.brand_color || "#2563EB"}; padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">${type === "invoice" ? "Invoice" : "Quote"} ${documentNumber}</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="white-space: pre-line; color: #374151; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #6b7280;">Document</td><td style="text-align: right; font-weight: 600;">${documentNumber}</td></tr>
              <tr><td style="color: #6b7280;">Amount</td><td style="text-align: right; font-weight: 600; color: ${profile?.brand_color || "#2563EB"};">R${total.toFixed(2)}</td></tr>
            </table>
            ${type === "invoice" && profile?.bank_name ? `
              <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 6px;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Banking Details</p>
                <p style="font-size: 13px; color: #374151; margin: 2px 0;">Bank: ${profile.bank_name}</p>
                <p style="font-size: 13px; color: #374151; margin: 2px 0;">Account Holder: ${profile.bank_account_holder}</p>
                <p style="font-size: 13px; color: #374151; margin: 2px 0;">Account Number: ${profile.bank_account_number}</p>
                <p style="font-size: 13px; color: #374151; margin: 2px 0;">Branch Code: ${profile.bank_branch_code}</p>
                ${profile.bank_account_type ? `<p style="font-size: 13px; color: #374151; margin: 2px 0;">Account Type: ${profile.bank_account_type}</p>` : ""}
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
