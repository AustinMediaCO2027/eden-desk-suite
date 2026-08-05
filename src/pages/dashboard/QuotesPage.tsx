import { DocumentPageAds } from "@/components/ads/AdBanner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Save, ArrowLeft, X, Send, Palette, FileText, Copy } from "lucide-react";
import LogoUploadWidget from "@/components/dashboard/LogoUploadWidget";
import { LineItem, calculateTotals, emptyLineItem, formatNumberInput, parseNumberInput } from "@/lib/document-utils";
import CompanyProfileBanner from "@/components/dashboard/CompanyProfileBanner";
import ClientSelector from "@/components/dashboard/ClientSelector";
import { downloadDocumentPDF } from "@/lib/pdf";
import DocumentPreview, { QUOTE_TEMPLATE_OPTIONS, COLOR_OPTIONS } from "@/components/templates/DocumentPreview";
import SendDocumentDialog from "@/components/dashboard/SendDocumentDialog";
import type { Json } from "@/integrations/supabase/types";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import PaywallDialog from "@/components/PaywallDialog";
import { useAuthGate } from "@/components/SignInPromptDialog";

interface QuoteForm {
  id?: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  date: string;
  items: LineItem[];
  tax_rate: number;
  notes: string;
  status: string;
}

const emptyQuote = (): QuoteForm => ({
  quote_number: `QT-${Date.now().toString().slice(-6)}`,
  client_name: "",
  client_email: "",
  client_address: "",
  date: new Date().toISOString().split("T")[0],
  items: [emptyLineItem()],
  tax_rate: 15,
  notes: "",
  status: "pending",
});

const QuotesPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showPaywall, setShowPaywall, checkAndProceed } = useGenerationLimit("quote");
  const { requireAuth, gateDialog } = useAuthGate("create your quote");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [editing, setEditing] = useState<QuoteForm | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>("");

  const fetchQuotes = async () => {
    if (!user) return;
    const { data } = await supabase.from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setQuotes(data);
  };

  useEffect(() => { fetchQuotes(); }, [user]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (!editing) return;
    const items = [...editing.items];
    (items[index] as any)[field] = value;
    if (field === "quantity" || field === "rate") {
      items[index].amount = Number(items[index].quantity) * Number(items[index].rate);
    }
    setEditing({ ...editing, items });
  };

  const saveQuote = async () => {
    if (!editing || !user) return;
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    const payload = {
      user_id: user.id,
      quote_number: editing.quote_number,
      client_name: editing.client_name,
      client_email: editing.client_email,
      client_address: editing.client_address,
      date: editing.date,
      items: editing.items as unknown as Json,
      tax_rate: editing.tax_rate,
      subtotal,
      tax_amount: taxAmount,
      total,
      notes: editing.notes,
      status: editing.status,
    };

    let error;
    if (editing.id) {
      ({ error } = await supabase.from("quotes").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("quotes").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Quote saved successfully." });
      setEditing(null);
      fetchQuotes();
    }
  };

  const deleteQuote = async (id: string) => {
    await supabase.from("quotes").delete().eq("id", id);
    fetchQuotes();
  };

  const loadQuote = (q: any) => {
    setEditing({
      id: q.id,
      quote_number: q.quote_number,
      client_name: q.client_name,
      client_email: q.client_email || "",
      client_address: q.client_address || "",
      date: q.date || "",
      items: (q.items as LineItem[]) || [emptyLineItem()],
      tax_rate: q.tax_rate || 15,
      notes: q.notes || "",
      status: q.status || "pending",
    });
  };

  const convertToInvoice = async (q: any) => {
    if (!user) return;
    const { subtotal, taxAmount, total } = calculateTotals(
      (q.items as LineItem[]) || [],
      q.tax_rate || 15
    );
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("invoices").insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_name: q.client_name,
      client_email: q.client_email || "",
      client_address: q.client_address || "",
      date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      items: q.items as unknown as Json,
      tax_rate: q.tax_rate || 15,
      subtotal,
      tax_amount: taxAmount,
      total,
      notes: q.notes || "",
      status: "draft",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Converted", description: `Invoice ${invoiceNumber} created from ${q.quote_number}.` });
      navigate("/dashboard/invoices");
    }
  };


  if (previewing && editing) {
    const activeTemplate = previewTemplate || profile?.template_style || "template1";
    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="outline" size="sm" onClick={() => setPreviewing(false)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button
            size="sm"
            onClick={() =>
              requireAuth(() => downloadDocumentPDF(
                {
                  type: "quote",
                  profile,
                  templateStyle: activeTemplate,
                  documentNumber: editing.quote_number,
                  date: editing.date,
                  clientName: editing.client_name,
                  clientEmail: editing.client_email,
                  clientAddress: editing.client_address,
                  items: editing.items,
                  taxRate: editing.tax_rate,
                  notes: editing.notes,
                  status: editing.status,
                  colorOverride: previewColor || undefined,
                },
                `quote-${editing.quote_number}`
              ))
            }
          >
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => requireAuth(() => setShowSendDialog(true))}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
          {gateDialog}
        </div>

        {showSendDialog && (
          <SendDocumentDialog
            type="quote"
            templateStyle={activeTemplate}
            documentNumber={editing.quote_number}
            clientEmail={editing.client_email}
            clientName={editing.client_name}
            clientAddress={editing.client_address}
            total={calculateTotals(editing.items, editing.tax_rate).total}
            items={editing.items}
            taxRate={editing.tax_rate}
            date={editing.date}
            notes={editing.notes}
            status={editing.status}
            profile={profile}
            onClose={() => setShowSendDialog(false)}
          />
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Choose Template</p>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {QUOTE_TEMPLATE_OPTIONS.map(t => (
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
            {COLOR_OPTIONS.map(c => (
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
          <DocumentPreview
            id="quote-preview"
            templateStyle={activeTemplate}
            type="quote"
            profile={profile}
            documentNumber={editing.quote_number}
            date={editing.date}
            clientName={editing.client_name}
            clientEmail={editing.client_email}
            clientAddress={editing.client_address}
            items={editing.items}
            taxRate={editing.tax_rate}
            notes={editing.notes}
            status={editing.status}
            colorOverride={previewColor || undefined}
          />
        </div>
      </div>
    );
  }

  // Edit
  if (editing) {
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editing.id ? "Edit Quote" : "New Quote"}</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
        </div>

        {/* Company Profile Banner */}
        <CompanyProfileBanner profile={profile} />
        <LogoUploadWidget logoUrl={profile?.logo_url} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Quote Number</Label><Input value={editing.quote_number} onChange={e => setEditing({ ...editing, quote_number: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Status</Label>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
              <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Client Name</Label>
              <ClientSelector onSelect={c => setEditing({ ...editing, client_name: c.name, client_email: c.email, client_address: c.address })} />
            </div>
            <Input value={editing.client_name} onChange={e => setEditing({ ...editing, client_name: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2"><Label>Client Email</Label><Input value={editing.client_email} onChange={e => setEditing({ ...editing, client_email: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="bg-secondary" /></div>
        </div>
        <div className="space-y-2"><Label>Client Address</Label><Textarea value={editing.client_address} onChange={e => setEditing({ ...editing, client_address: e.target.value })} className="bg-secondary" rows={2} /></div>
        <div>
          <Label className="mb-2 block">Line Items</Label>
          <div className="space-y-2">
            {editing.items.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><Input placeholder="Item name (e.g. Banner Print)" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="bg-secondary" /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" value={formatNumberInput(item.quantity)} onChange={e => updateItem(i, "quantity", parseNumberInput(e.target.value))} className="bg-secondary" /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Rate" value={formatNumberInput(item.rate)} onChange={e => updateItem(i, "rate", parseNumberInput(e.target.value))} className="bg-secondary" /></div>
                  <div className="col-span-2 text-right text-sm font-medium py-2">R{Number(item.amount).toFixed(2)}</div>
                  <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) })} disabled={editing.items.length === 1}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></div>
                </div>
                <div>
                  <Input placeholder="Details (e.g. 3000x3000mm | including installation)" value={item.details || ""} onChange={e => updateItem(i, "details", e.target.value)} className="bg-secondary text-xs h-8" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing({ ...editing, items: [...editing.items, emptyLineItem()] })}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Tax Rate (%)</Label><Input type="number" value={editing.tax_rate} onChange={e => setEditing({ ...editing, tax_rate: Number(e.target.value) })} className="bg-secondary" /></div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Subtotal: R{subtotal.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Tax: R{taxAmount.toFixed(2)}</p>
            <p className="text-lg font-bold">Total: R{total.toFixed(2)}</p>
          </div>
        </div>
        <div className="space-y-2"><Label>Notes / Terms</Label><Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="bg-secondary" rows={3} placeholder="Payment terms, thank you message, etc." /></div>
        <div className="flex gap-2">
          {gateDialog}<Button onClick={() => requireAuth(() => checkAndProceed(saveQuote))}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={() => setPreviewing(true)}>Preview & Download</Button>
        </div>
        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  // List
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
    <div className="space-y-6 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Button onClick={() => requireAuth(() => setEditing(emptyQuote()))}><Plus className="h-4 w-4 mr-1" /> New Quote</Button>{gateDialog}
      </div>
      {quotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center"><p className="text-muted-foreground">No quotes yet. Create your first one.</p></div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between eden-card-hover cursor-pointer" onClick={() => loadQuote(q)}>
              <div><p className="font-medium">{q.quote_number}</p><p className="text-sm text-muted-foreground">{q.client_name}</p></div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">R{Number(q.total).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'accepted' ? 'bg-green-900/30 text-green-400' : q.status === 'declined' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{q.status}</span>
                </div>
                {q.status === 'accepted' && (
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); convertToInvoice(q); }} title="Convert to Invoice">
                    <FileText className="h-4 w-4 mr-1" /> Invoice
                  </Button>
                )}
                <Button variant="ghost" size="sm" title="Duplicate" onClick={(e) => { e.stopPropagation(); setEditing({ ...emptyQuote(), client_name: q.client_name, client_email: q.client_email || "", client_address: q.client_address || "", items: (q.items as LineItem[]) || [emptyLineItem()], tax_rate: q.tax_rate || 15, notes: q.notes || "", status: "pending" }); }}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); loadQuote(q); setPreviewing(true); }}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteQuote(q.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <DocumentPageAds />
    </div>
  );
};

export default QuotesPage;
