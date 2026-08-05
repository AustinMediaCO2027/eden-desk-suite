import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { useAuthGate } from "@/components/SignInPromptDialog";
import { isValidEmailAddress, sanitizeDocumentFilename } from "@/lib/document-export-utils";

interface SendAttachmentDialogProps {
  title: string;
  profile: Profile | null;
  defaultTo?: string;
  defaultSubject: string;
  defaultMessage: string;
  filename: string;
  /** Returns the PDF as a base64 string, or null when generation fails. */
  buildPdf: () => Promise<string | null>;
  onClose: () => void;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Shared email dialog for accounting documents (purchase orders, statements).
 * Mirrors the existing SendDocumentDialog behaviour, including guest gating.
 */
const SendAttachmentDialog = ({
  title,
  profile,
  defaultTo = "",
  defaultSubject,
  defaultMessage,
  filename,
  buildPdf,
  onClose,
}: SendAttachmentDialogProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const { requireAuth, gateDialog, isGuest } = useAuthGate("send this document");

  const handleSend = async () => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    const trimmedEmail = email.trim();
    if (!isValidEmailAddress(trimmedEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid recipient email address.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const pdfBase64 = await buildPdf();
      if (!pdfBase64) throw new Error("PDF generation failed. Please try again.");

      const brandColor = profile?.brand_color || "#2563EB";
      const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;">
          <div style="background:${escapeHtml(brandColor)};padding:18px 22px;color:#ffffff;">
            <p style="margin:0;font-size:16px;font-weight:700;">${escapeHtml(profile?.company_name || "Eden Desk")}</p>
          </div>
          <div style="padding:22px;">
            <p style="white-space:pre-line;font-size:14px;line-height:1.6;margin:0;">${escapeHtml(message)}</p>
          </div>
          <div style="padding:14px 22px;border-top:1px solid #eeeeee;font-size:11px;color:#888888;">
            Sent via Eden Desk
          </div>
        </div>`;

      const attachments = [
        {
          filename: `${sanitizeDocumentFilename(filename, "document")}.pdf`,
          content: pdfBase64,
          content_type: "application/pdf",
        },
      ];

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: trimmedEmail,
          subject,
          html,
          from_name: profile?.company_name || "Eden Desk",
          from_email: profile?.company_email || undefined,
          attachments,
        },
      });

      if (error) throw error;
      toast({ title: "Email sent", description: `Delivered to ${trimmedEmail}.` });
      onClose();
    } catch (error: any) {
      toast({ title: "Send failed", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {gateDialog}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Recipient email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary" placeholder="name@company.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Textarea rows={7} value={message} onChange={(e) => setMessage(e.target.value)} className="bg-secondary" />
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full">
            <Send className="mr-1 h-4 w-4" /> {sending ? "Sending..." : "Send with PDF attached"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default SendAttachmentDialog;
