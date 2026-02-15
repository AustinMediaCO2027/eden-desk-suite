import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Save, ArrowLeft, X, Bot, Send, Palette, Mail, FileText } from "lucide-react";
import LogoUploadWidget from "@/components/dashboard/LogoUploadWidget";
import SignatureUploadWidget from "@/components/dashboard/SignatureUploadWidget";
import { downloadPDF } from "@/lib/pdf";
import LetterheadPreview from "@/components/letterhead/LetterheadPreview";
import { LETTERHEAD_TEMPLATES, LETTERHEAD_COLORS } from "@/components/letterhead/LetterheadTypes";
import ClientSelector from "@/components/dashboard/ClientSelector";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import PaywallDialog from "@/components/PaywallDialog";

interface LetterheadForm {
  id?: string;
  title: string;
  body: string;
  recipient_name: string;
  recipient_title: string;
  recipient_company: string;
  recipient_address: string;
  recipient_phone: string;
  recipient_email: string;
  date: string;
  subject: string;
  closing: string;
  sender_name: string;
  sender_title: string;
  signature_url: string;
}

const emptyLetterhead = (): LetterheadForm => ({
  title: "Untitled",
  body: "",
  recipient_name: "",
  recipient_title: "",
  recipient_company: "",
  recipient_address: "",
  recipient_phone: "",
  recipient_email: "",
  date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  subject: "",
  closing: "Sincerely,",
  sender_name: "",
  sender_title: "",
  signature_url: "",
});

const LetterheadPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { showPaywall, setShowPaywall, checkAndProceed } = useGenerationLimit();
  const [letterheads, setLetterheads] = useState<any[]>([]);
  const [editing, setEditing] = useState<LetterheadForm | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState("");
  const [previewColor, setPreviewColor] = useState("");
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [showSendForm, setShowSendForm] = useState(false);


  const fetchLetterheads = async () => {
    if (!user) return;
    const { data } = await supabase.from("letterheads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setLetterheads(data);
  };

  useEffect(() => { fetchLetterheads(); }, [user]);

  const saveLetterhead = async () => {
    if (!editing || !user) return;
    const payload = {
      user_id: user.id,
      title: editing.title,
      body: editing.body,
      recipient_name: editing.recipient_name,
      recipient_title: editing.recipient_title,
      recipient_company: editing.recipient_company,
      recipient_address: editing.recipient_address,
      recipient_phone: editing.recipient_phone,
      recipient_email: editing.recipient_email,
      date: editing.date,
      subject: editing.subject,
      closing: editing.closing,
      sender_name: editing.sender_name,
      sender_title: editing.sender_title,
      signature_url: editing.signature_url,
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("letterheads").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("letterheads").insert(payload));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditing(null);
      fetchLetterheads();
    }
  };

  const deleteLetterhead = async (id: string) => {
    await supabase.from("letterheads").delete().eq("id", id);
    fetchLetterheads();
  };

  const loadLetterhead = (l: any) => {
    setEditing({
      id: l.id,
      title: l.title || "",
      body: l.body || "",
      recipient_name: l.recipient_name || "",
      recipient_title: l.recipient_title || "",
      recipient_company: l.recipient_company || "",
      recipient_address: l.recipient_address || "",
      recipient_phone: l.recipient_phone || "",
      recipient_email: l.recipient_email || "",
      date: l.date || "",
      subject: l.subject || "",
      closing: l.closing || "Sincerely,",
      sender_name: l.sender_name || "",
      sender_title: l.sender_title || "",
      signature_url: l.signature_url || "",
    });
  };

  const handleAIDraft = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await supabase.functions.invoke("ai-draft", {
        body: { prompt: aiPrompt, type: "letterhead" },
      });
      if (resp.error) throw new Error(resp.error.message);
      const text = resp.data?.text || resp.data?.content || "";
      if (text && editing) {
        setEditing({ ...editing, body: editing.body ? editing.body + "\n\n" + text : text });
        toast({ title: "AI Draft generated" });
      }
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  };

  const handleSendEmail = async () => {
    if (!sendEmail.trim() || !editing) return;
    setSending(true);
    try {
      const subject = editing.subject || editing.title || "Letterhead";
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
            ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="height: 40px; margin-bottom: 8px;" />` : ""}
            <h2 style="margin: 0; font-size: 18px; color: #111;">${profile?.company_name || "Your Company"}</h2>
            ${profile?.company_address ? `<p style="margin: 2px 0; font-size: 12px; color: #666;">${profile.company_address}</p>` : ""}
          </div>
          ${editing.date ? `<p style="font-size: 14px; color: #444; margin-bottom: 16px;">${editing.date}</p>` : ""}
          ${editing.recipient_name ? `
            <div style="margin-bottom: 16px; font-size: 14px;">
              <p style="margin: 0; font-weight: bold;">${editing.recipient_name}</p>
              ${editing.recipient_title ? `<p style="margin: 0; color: #666;">${editing.recipient_title}</p>` : ""}
              ${editing.recipient_company ? `<p style="margin: 0; color: #666;">${editing.recipient_company}</p>` : ""}
              ${editing.recipient_address ? `<p style="margin: 0; color: #666;">${editing.recipient_address}</p>` : ""}
            </div>
          ` : ""}
          ${editing.recipient_name ? `<p style="font-size: 14px; margin-bottom: 16px;">Dear ${editing.recipient_name},</p>` : ""}
          <div style="font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">${editing.body}</div>
          <div style="margin-top: 32px; font-size: 14px;">
            <p style="margin-bottom: 24px;">${editing.closing}</p>
            <p style="font-weight: bold; margin: 0;">${editing.sender_name || profile?.company_name || ""}</p>
            ${editing.sender_title ? `<p style="margin: 0; color: #666;">${editing.sender_title}</p>` : ""}
          </div>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 12px; font-size: 11px; color: #999; text-align: center;">
            ${profile?.company_phone ? `${profile.company_phone}` : ""}
            ${profile?.company_email ? ` | ${profile.company_email}` : ""}
            ${profile?.company_website ? ` | ${profile.company_website}` : ""}
          </div>
        </div>
      `;
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: sendEmail, subject, html: htmlBody },
      });
      if (error) throw error;
      toast({ title: "Sent!", description: `Letterhead emailed to ${sendEmail}` });
      setShowSendForm(false);
      setSendEmail("");
    } catch (err: any) {
      toast({ title: "Send Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // Preview mode
  if (previewing && editing) {
    const activeTemplate = previewTemplate || profile?.template_style || "classic";
    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="outline" size="sm" onClick={() => setPreviewing(false)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button size="sm" onClick={() => downloadPDF("letterhead-preview", `letterhead-${editing.title}`)}>
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setShowSendForm(!showSendForm); setSendEmail(editing.recipient_email || ""); }}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        </div>

        {showSendForm && (
          <div className="rounded-xl border border-border bg-card p-4 flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Recipient Email</Label>
              <Input value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="email@example.com" className="bg-secondary" />
            </div>
            <Button onClick={handleSendEmail} disabled={sending || !sendEmail.trim()}>
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        )}

        {/* Template + Color switcher */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Choose Template</p>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {LETTERHEAD_TEMPLATES.map(t => (
              <button
                key={t.value}
                onClick={() => setPreviewTemplate(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTemplate === t.value
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground mr-1">Colour:</p>
            {LETTERHEAD_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setPreviewColor(previewColor === c.value ? "" : c.value)}
                title={c.label}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  previewColor === c.value ? "border-foreground scale-110" : "border-transparent hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-border shadow-lg">
          <LetterheadPreview
            id="letterhead-preview"
            templateStyle={activeTemplate}
            profile={profile}
            recipientName={editing.recipient_name}
            recipientTitle={editing.recipient_title}
            recipientCompany={editing.recipient_company}
            recipientAddress={editing.recipient_address}
            recipientPhone={editing.recipient_phone}
            recipientEmail={editing.recipient_email}
            date={editing.date}
            subject={editing.subject}
            body={editing.body}
            closing={editing.closing}
            senderName={editing.sender_name}
            senderTitle={editing.sender_title}
            colorOverride={previewColor || undefined}
            signatureUrl={editing.signature_url || undefined}
          />
        </div>
      </div>
    );
  }

  // Edit mode
  if (editing) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editing.id ? "Edit Letterhead" : "New Letterhead"}</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
        </div>

        <LogoUploadWidget logoUrl={profile?.logo_url} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Document Title</Label>
            <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="bg-secondary" placeholder="e.g. Recommendation Letter" />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="bg-secondary" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subject (optional)</Label>
          <Input value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} className="bg-secondary" placeholder="e.g. Letter of Recommendation" />
        </div>

        {/* Recipient */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Recipient Details</Label>
            <ClientSelector onSelect={c => setEditing({ ...editing, recipient_name: c.name, recipient_email: c.email, recipient_address: c.address })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input value={editing.recipient_name} onChange={e => setEditing({ ...editing, recipient_name: e.target.value })} className="bg-secondary" placeholder="Full name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title / Position</Label>
              <Input value={editing.recipient_title} onChange={e => setEditing({ ...editing, recipient_title: e.target.value })} className="bg-secondary" placeholder="e.g. Director" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Company</Label>
              <Input value={editing.recipient_company} onChange={e => setEditing({ ...editing, recipient_company: e.target.value })} className="bg-secondary" placeholder="Company name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={editing.recipient_email} onChange={e => setEditing({ ...editing, recipient_email: e.target.value })} className="bg-secondary" placeholder="Email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={editing.recipient_address} onChange={e => setEditing({ ...editing, recipient_address: e.target.value })} className="bg-secondary" placeholder="Address" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input value={editing.recipient_phone} onChange={e => setEditing({ ...editing, recipient_phone: e.target.value })} className="bg-secondary" placeholder="Phone" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label>Letter Content</Label>
          <Textarea value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} className="bg-secondary min-h-[250px]" placeholder="Write your letter content here..." />
        </div>

        {/* Closing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Closing</Label>
            <Input value={editing.closing} onChange={e => setEditing({ ...editing, closing: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Sender Name</Label>
            <Input value={editing.sender_name} onChange={e => setEditing({ ...editing, sender_name: e.target.value })} className="bg-secondary" placeholder="Your name" />
        </div>

        <SignatureUploadWidget
          signatureUrl={editing.signature_url || null}
          onUploaded={(url) => setEditing({ ...editing, signature_url: url })}
          onRemoved={() => setEditing({ ...editing, signature_url: "" })}
        />
          <div className="space-y-2">
            <Label>Sender Title</Label>
            <Input value={editing.sender_title} onChange={e => setEditing({ ...editing, sender_title: e.target.value })} className="bg-secondary" placeholder="e.g. CEO" />
          </div>
        </div>

        {/* AI Draft */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">AI Draft Assistant</h3>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Describe what you need drafted..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="bg-secondary" onKeyDown={e => e.key === "Enter" && handleAIDraft()} />
            <Button onClick={handleAIDraft} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? "Drafting..." : "Draft"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => checkAndProceed(saveLetterhead)}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={() => setPreviewing(true)}>Preview & Download</Button>
        </div>
        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  // List mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Letterheads</h1>
        <Button onClick={() => setEditing(emptyLetterhead())}><Plus className="h-4 w-4 mr-1" /> New Letterhead</Button>
      </div>
      {letterheads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-9 w-9 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-semibold">Create Professional Letterheads</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Design branded letterheads with your company logo, colours, and details. Choose from Classic, Corporate, or Executive templates — then download as PDF or email directly.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"><FileText className="h-3.5 w-3.5" /> 3 Templates</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"><Palette className="h-3.5 w-3.5" /> Custom Colours</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"><Download className="h-3.5 w-3.5" /> PDF Export</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50"><Send className="h-3.5 w-3.5" /> Email Direct</span>
          </div>
          <Button size="lg" className="mt-2" onClick={() => setEditing(emptyLetterhead())}>
            <Plus className="h-4 w-4 mr-2" /> Create Your First Letterhead
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {letterheads.map(l => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between eden-card-hover cursor-pointer" onClick={() => loadLetterhead(l)}>
              <div>
                <p className="font-medium">{l.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">{l.recipient_name ? `To: ${l.recipient_name}` : new Date(l.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); loadLetterhead(l); setPreviewing(true); }}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteLetterhead(l.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LetterheadPage;
