import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Mail, ExternalLink } from "lucide-react";
import { generateDocumentPDFBase64 } from "@/lib/pdf";
import { useAuthGate } from "@/components/SignInPromptDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { isValidEmailAddress, sanitizeDocumentFilename } from "@/lib/document-export-utils";

interface SendLetterheadDialogProps {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  date: string;
  recipientTitle: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientPhone: string;
  closing: string;
  senderName: string;
  senderTitle: string;
  signatureUrl?: string;
  colorOverride?: string;
  title: string;
  profile: Profile | null;
  onClose: () => void;
}

const SendLetterheadDialog = ({
  recipientEmail: initialEmail,
  recipientName,
  subject: letterSubject,
  body: letterBody,
  date,
  recipientTitle,
  recipientCompany,
  recipientAddress,
  recipientPhone,
  closing,
  senderName,
  senderTitle,
  signatureUrl,
  colorOverride,
  title,
  profile,
  onClose,
}: SendLetterheadDialogProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [emailSubject, setEmailSubject] = useState(
    letterSubject || title || `Letter from ${profile?.company_name || "us"}`
  );
  const [message, setMessage] = useState(
    `Hi ${recipientName || ""},\n\nPlease find attached the letter regarding "${letterSubject || title}".\n\nKind regards,\n${profile?.company_name || senderName || ""}`
  );

  const { requireAuth, gateDialog, isGuest } = useAuthGate("send this document");

  const handleSend = async () => {
    if (isGuest) { requireAuth(() => {}); return; }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast({ title: "Error", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }
    if (!isValidEmailAddress(trimmedEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const pdfBase64 = await generateDocumentPDFBase64({
        type: "letterhead",
        profile,
        recipientName,
        recipientTitle,
        recipientCompany,
        recipientAddress,
        recipientPhone,
        recipientEmail: trimmedEmail,
        date,
        subject: letterSubject,
        body: letterBody,
        closing,
        senderName,
        senderTitle,
        colorOverride,
        signatureUrl,
        watermark: !isPaid,
      });

      if (!pdfBase64) throw new Error("PDF generation failed.");

      const brandColor = profile?.brand_color || "#2563EB";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${brandColor}; padding: 24px; border-radius: 8px 8px 0 0;">
            ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 8px;" />` : ""}
            <h2 style="color: white; margin: 0; font-size: 20px;">${emailSubject}</h2>
            ${profile?.company_name ? `<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">${profile.company_name}</p>` : ""}
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="white-space: pre-line; color: #374151; line-height: 1.6; font-size: 14px;">${message}</p>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">The full letter is attached as a PDF.</p>
          </div>
          <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px;">Sent via Eden Desk</p>
        </div>
      `;

      const attachmentFilename = `letterhead-${sanitizeDocumentFilename(title || "letter", "letter")}.pdf`;
      const attachments = [{ filename: attachmentFilename, content: pdfBase64, content_type: "application/pdf" }];

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: trimmedEmail,
          subject: emailSubject,
          html,
          from_name: profile?.company_name || "Eden Desk",
          from_email: profile?.company_email || undefined,
          attachments,
        },
      });

      if (error || data?.error) {
        let parsedPayload: any = null;
        if (error?.message) {
          const jsonStart = error.message.indexOf("{");
          if (jsonStart !== -1) {
            try { parsedPayload = JSON.parse(error.message.slice(jsonStart)); } catch { parsedPayload = null; }
          }
        }
        const detailedMessage = data?.message || parsedPayload?.message || data?.error || parsedPayload?.error || error?.message || "Failed to send";
        const errorCode = data?.code || parsedPayload?.code;
        if (errorCode === "RESEND_SANDBOX_RESTRICTION" || errorCode === "RESEND_DOMAIN_NOT_VERIFIED") {
          throw new Error(`${detailedMessage}. Please verify your sender domain DNS, then try again.`);
        }
        throw new Error(detailedMessage);
      }

      toast({ title: "Email sent!", description: `Letterhead sent to ${trimmedEmail}` });
      onClose();
    } catch (err: any) {
      toast({ title: "Send failed", description: err?.message || "Unable to send email.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const openMailto = () => {
    if (isGuest) { requireAuth(() => {}); return; }
    const body = encodeURIComponent(message);
    const subj = encodeURIComponent(emailSubject);
    window.open(`mailto:${email}?subject=${subj}&body=${body}`, "_blank");
  };

  return (
    <>
    {gateDialog}
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 space-y-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Send Letterhead</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>To</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="bg-secondary" rows={5} />
          </div>
          <p className="text-xs text-muted-foreground">PDF will be attached automatically</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSend} disabled={sending || !email.trim()} className="flex-1">
            <Send className="h-4 w-4 mr-1" />
            {sending ? "Generating PDF & Sending..." : "Send Email with PDF"}
          </Button>
          <Button variant="outline" onClick={openMailto}>
            <ExternalLink className="h-4 w-4 mr-1" /> Open Email App
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SendLetterheadDialog;
