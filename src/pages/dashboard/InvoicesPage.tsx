import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Save, ArrowLeft, X, Send, Palette, Copy } from "lucide-react";
import LogoUploadWidget from "@/components/dashboard/LogoUploadWidget";
import { LineItem, calculateTotals, emptyLineItem, formatNumberInput, parseNumberInput } from "@/lib/document-utils";
import CompanyProfileBanner from "@/components/dashboard/CompanyProfileBanner";
import ClientSelector from "@/components/dashboard/ClientSelector";
import { downloadDocumentPDF } from "@/lib/pdf";
import DocumentPreview, { INVOICE_TEMPLATE_OPTIONS, COLOR_OPTIONS } from "@/components/templates/DocumentPreview";
import SendDocumentDialog from "@/components/dashboard/SendDocumentDialog";
import type { Json } from "@/integrations/supabase/types";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import PaywallDialog from "@/components/PaywallDialog";

interface InvoiceForm {
  id?: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  date: string;
  due_date: string;
  items: LineItem[];
  tax_rate: number;
  notes: string;
  status: string;
}

const emptyInvoice = (): InvoiceForm => ({
  invoice_number: `INV-${Date.now().toString().slice(-6)}`,
  client_name: "",
  client_email: "",
  client_address: "",
  date: new Date().toISOString().split("T")[0],
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  items: [emptyLineItem()],
  tax_rate: 15,
  notes: "",
  status: "draft",
});

const InvoicesPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { showPaywall, setShowPaywall, checkAndProceed } = useGenerationLimit("invoice");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [editing, setEditing] = useState<InvoiceForm | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>("");

  const fetchInvoices = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setInvoices(data);
  };

  useEffect(() => { fetchInvoices(); }, [user]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (!editing) return;
    const items = [...editing.items];
    (items[index] as any)[field] = value;
    if (field === "quantity" || field === "rate") {
      items[index].amount = Number(items[index].quantity) * Number(items[index].rate);
    }
    setEditing({ ...editing, items });
  };

  const saveInvoice = async () => {
    if (!editing || !user) return;
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    const payload = {
      user_id: user.id,
      invoice_number: editing.invoice_number,
      client_name: editing.client_name,
      client_email: editing.client_email,
      client_address: editing.client_address,
      date: editing.date,
      due_date: editing.due_date,
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
      ({ error } = await supabase.from("invoices").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("invoices").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Invoice saved successfully." });
      setEditing(null);
      fetchInvoices();
    }
  };

  const deleteInvoice = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    fetchInvoices();
  };

  const loadInvoice = (inv: any) => {
    setEditing({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      client_email: inv.client_email || "",
      client_address: inv.client_address || "",
      date: inv.date || "",
      due_date: inv.due_date || "",
      items: (inv.items as LineItem[]) || [emptyLineItem()],
      tax_rate: inv.tax_rate ?? 15,
      notes: inv.notes || "",
      status: inv.status || "draft",
    });
  };

  // Preview mode
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
              downloadDocumentPDF(
                {
                  type: "invoice",
                  profile,
                  templateStyle: activeTemplate,
                  documentNumber: editing.invoice_number,
                  date: editing.date,
                  dueDate: editing.due_date,
                  clientName: editing.client_name,
                  clientEmail: editing.client_email,
                  clientAddress: editing.client_address,
                  items: editing.items,
                  taxRate: editing.tax_rate,
                  notes: editing.notes,
                  status: editing.status,
                  colorOverride: previewColor || undefined,
                },
                `invoice-${editing.invoice_number}`
              )
            }
          >
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowSendDialog(true)}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        </div>

        {showSendDialog && (
          <SendDocumentDialog
            type="invoice"
            templateStyle={activeTemplate}
            documentNumber={editing.invoice_number}
            clientEmail={editing.client_email}
            clientName={editing.client_name}
            clientAddress={editing.client_address}
            total={calculateTotals(editing.items, editing.tax_rate).total}
            items={editing.items}
            taxRate={editing.tax_rate}
            date={editing.date}
            dueDate={editing.due_date}
            notes={editing.notes}
            status={editing.status}
            profile={profile}
            onClose={() => setShowSendDialog(false)}
          />
        )}

        {/* Template switcher */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Choose Template</p>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {INVOICE_TEMPLATE_OPTIONS.map(t => (
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
            id="invoice-preview"
            templateStyle={activeTemplate}
            type="invoice"
            profile={profile}
            documentNumber={editing.invoice_number}
            date={editing.date}
            dueDate={editing.due_date}
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

  // Edit mode
  if (editing) {
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editing.id ? "Edit Invoice" : "New Invoice"}</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
        </div>

        {/* Company Profile Banner */}
        <CompanyProfileBanner profile={profile} />
        <LogoUploadWidget logoUrl={profile?.logo_url} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input value={editing.invoice_number} onChange={e => setEditing({ ...editing, invoice_number: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Client Name</Label>
              <ClientSelector onSelect={c => setEditing({ ...editing, client_name: c.name, client_email: c.email, client_address: c.address })} />
            </div>
            <Input value={editing.client_name} onChange={e => setEditing({ ...editing, client_name: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Client Email</Label>
            <Input value={editing.client_email} onChange={e => setEditing({ ...editing, client_email: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={editing.due_date} onChange={e => setEditing({ ...editing, due_date: e.target.value })} className="bg-secondary" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client Address</Label>
          <Textarea value={editing.client_address} onChange={e => setEditing({ ...editing, client_address: e.target.value })} className="bg-secondary" rows={2} />
        </div>

        <div>
          <Label className="mb-2 block">Line Items</Label>
          <div className="space-y-2">
            {editing.items.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input placeholder="Item name (e.g. Banner Print)" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="bg-secondary" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Qty" value={formatNumberInput(item.quantity)} onChange={e => updateItem(i, "quantity", parseNumberInput(e.target.value))} className="bg-secondary" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Rate" value={formatNumberInput(item.rate)} onChange={e => updateItem(i, "rate", parseNumberInput(e.target.value))} className="bg-secondary" />
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium py-2">R{Number(item.amount).toFixed(2)}</div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) })} disabled={editing.items.length === 1}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="pl-0">
                  <Input placeholder="Details (e.g. 3000x3000mm | including installation)" value={item.details || ""} onChange={e => updateItem(i, "details", e.target.value)} className="bg-secondary text-xs h-8" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing({ ...editing, items: [...editing.items, emptyLineItem()] })}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" value={editing.tax_rate} onChange={e => setEditing({ ...editing, tax_rate: Number(e.target.value) })} className="bg-secondary" />
          </div>
          <div className="space-y-1 text-right">
            {editing.tax_rate > 0 && (
              <>
                <p className="text-sm text-muted-foreground">Subtotal: R{subtotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Tax: R{taxAmount.toFixed(2)}</p>
              </>
            )}
            <p className="text-lg font-bold">Total: R{total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes / Terms</Label>
          <Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="bg-secondary" rows={6} placeholder="Payment terms, thank you message, etc." />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => checkAndProceed(saveInvoice)}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={() => setPreviewing(true)}>Preview & Download</Button>
        </div>
        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  // List mode
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
    <div className="space-y-6 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setEditing(emptyInvoice())}><Plus className="h-4 w-4 mr-1" /> New Invoice</Button>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No invoices yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between eden-card-hover cursor-pointer" onClick={() => loadInvoice(inv)}>
              <div>
                <p className="font-medium">{inv.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{inv.client_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">R{Number(inv.total).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-900/30 text-green-400' : inv.status === 'overdue' ? 'bg-red-900/30 text-red-400' : 'bg-secondary text-muted-foreground'}`}>
                    {inv.status}
                  </span>
                </div>
                <Button variant="ghost" size="sm" title="Duplicate" onClick={(e) => { e.stopPropagation(); setEditing({ ...emptyInvoice(), client_name: inv.client_name, client_email: inv.client_email || "", client_address: inv.client_address || "", items: (inv.items as LineItem[]) || [emptyLineItem()], tax_rate: inv.tax_rate ?? 15, notes: inv.notes || "", status: "draft" }); }}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); loadInvoice(inv); setPreviewing(true); }}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}>
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

export default InvoicesPage;
