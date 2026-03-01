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
import { isValidEmailAddress, sanitizeDocumentFilename } from "@/lib/document-export-utils";

interface SendDocumentDialogProps {
  type: "invoice" | "quote";
  templateStyle?: string;
  documentNumber: string;
  clientEmail: string;
  clientName: string;
  clientAddress: string;
  total: number;
  items: any[];
  taxRate: number;
  date?: string;
  dueDate?: string;
  notes?: string;
  status?: string;
  profile: Profile | null;
  onClose: () => void;
}

const SendDocumentDialog = ({
  type,
  templateStyle = "classic",
  documentNumber,
  clientEmail,
  clientName,
  clientAddress,
  total,
  items,
  taxRate,
  date,
  dueDate,
  notes,
  status,
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast({ title: "Error", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }

    if (!isValidEmailAddress(trimmedEmail)) {
      toast({ title: "Invalid email", description: "Please enter a valid recipient email address.", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      const basePayload = {
        profile,
        templateStyle,
        documentNumber,
        date: date || new Date().toISOString().split("T")[0],
        clientName,
        clientEmail: trimmedEmail,
        clientAddress,
        items,
        taxRate,
        notes: notes || "",
        status: status || (type === "invoice" ? "draft" : "pending"),
      };

      const pdfBase64 =
        type === "invoice"
          ? await generateDocumentPDFBase64({ ...basePayload, type: "invoice", dueDate })
          : await generateDocumentPDFBase64({ ...basePayload, type: "quote" });

      if (!pdfBase64) {
        throw new Error("PDF generation failed. Please try again.");
      }

      const brandColor = profile?.brand_color || "#2563EB";
      const { subtotal, taxAmount } = (() => {
        const sub = items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
        const tax = sub * (taxRate / 100);
        return { subtotal: sub, taxAmount: tax };
      })();

      const html = buildEmailHtml({ type, documentNumber, clientName, email: trimmedEmail, date, dueDate, message, items, subtotal, taxAmount, taxRate, total, notes, profile, brandColor });

      const attachmentFilename = `${type}-${sanitizeDocumentFilename(documentNumber, "document")}.pdf`;
      const attachments = [{ filename: attachmentFilename, content: pdfBase64, content_type: "application/pdf" }];

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: trimmedEmail,
          subject,
          html,
          from_name: profile?.company_name || "Eden Desk",
          from_email: profile?.company_email || undefined,
          attachments,
        },
      });

      if (error || data?.error) {
        const detailedMessage =
          data?.message ||
          data?.details?.message ||
          data?.error ||
          error?.message ||
          "Failed to send";

        if (data?.code === "RESEND_SANDBOX_RESTRICTION") {
          throw new Error(`${detailedMessage}. Please verify your sender domain and update RESEND_FROM_EMAIL.`);
        }

        throw new Error(detailedMessage);
      }

      toast({ title: "Email sent!", description: `${type === "invoice" ? "Invoice" : "Quote"} sent to ${trimmedEmail}` });
      onClose();
    } catch (err: any) {
      toast({
        title: "Send failed",
        description: err?.message || "Unable to send email with attachment.",
        variant: "destructive",
      });
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
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="bg-secondary" rows={5} />
          </div>
          <p className="text-xs text-muted-foreground">PDF will be attached automatically</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSendViaEmail} disabled={sending || !email} className="flex-1">
            <Send className="h-4 w-4 mr-1" />
            {sending ? "Generating PDF & Sending..." : "Send Email with PDF"}
          </Button>
          <Button variant="outline" onClick={openMailto}>
            <ExternalLink className="h-4 w-4 mr-1" /> Open Email App
          </Button>
        </div>
      </div>
    </div>
  );
};

function buildEmailHtml({ type, documentNumber, clientName, email, date, dueDate, message, items, subtotal, taxAmount, taxRate, total, notes, profile, brandColor }: any) {
  const itemRowsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px;">${item.description || ""}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: right;">R${Number(item.rate).toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 13px; text-align: right; font-weight: 600;">R${Number(item.amount).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${brandColor}; padding: 24px; border-radius: 8px 8px 0 0;">
        ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 8px;" />` : ""}
        <h2 style="color: white; margin: 0; font-size: 20px;">${type === "invoice" ? "Invoice" : "Quote"} ${documentNumber}</h2>
        ${profile?.company_name ? `<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">${profile.company_name}</p>` : ""}
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="white-space: pre-line; color: #374151; line-height: 1.6; font-size: 14px; margin-bottom: 20px;">${message}</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead><tr style="background: #f9fafb;">
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Rate</th>
            <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr></thead>
          <tbody>${itemRowsHtml}</tbody>
        </table>
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="color: #6b7280; padding: 4px 0;">Subtotal</td><td style="text-align: right; color: #374151;">R${subtotal.toFixed(2)}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Tax (${taxRate}%)</td><td style="text-align: right; color: #374151;">R${taxAmount.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 2px solid ${brandColor}; color: #111827;">Total</td><td style="text-align: right; padding: 8px 0; font-weight: 700; font-size: 16px; border-top: 2px solid ${brandColor}; color: ${brandColor};">R${total.toFixed(2)}</td></tr>
        </table>
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
}

export default SendDocumentDialog;
