import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Save, ArrowLeft, X } from "lucide-react";
import { LineItem, calculateTotals, emptyLineItem } from "@/lib/document-utils";
import { downloadPDF } from "@/lib/pdf";
import type { Json } from "@/integrations/supabase/types";

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
  const [invoices, setInvoices] = useState<any[]>([]);
  const [editing, setEditing] = useState<InvoiceForm | null>(null);
  const [previewing, setPreviewing] = useState(false);

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
      tax_rate: inv.tax_rate || 15,
      notes: inv.notes || "",
      status: inv.status || "draft",
    });
  };

  if (previewing && editing) {
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewing(false)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button size="sm" onClick={() => downloadPDF("invoice-preview", `invoice-${editing.invoice_number}`)}>
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
        <div id="invoice-preview" className="bg-white text-black p-8 rounded-lg max-w-3xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-16 mb-2" />}
              <h2 className="text-xl font-bold">{profile?.company_name || "Your Company"}</h2>
              <p className="text-sm text-gray-600">{profile?.company_address}</p>
              <p className="text-sm text-gray-600">{profile?.company_email} {profile?.company_phone && `• ${profile.company_phone}`}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-sm text-gray-600 mt-1">#{editing.invoice_number}</p>
              <p className="text-sm text-gray-600">Date: {editing.date}</p>
              <p className="text-sm text-gray-600">Due: {editing.due_date}</p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Bill To</h3>
            <p className="font-medium">{editing.client_name}</p>
            <p className="text-sm text-gray-600">{editing.client_email}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{editing.client_address}</p>
          </div>
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-600">Qty</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-600">Rate</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {editing.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-sm">{item.description}</td>
                  <td className="py-2 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">R{Number(item.rate).toFixed(2)}</td>
                  <td className="py-2 text-sm text-right">R{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax ({editing.tax_rate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2"><span>Total</span><span>R{total.toFixed(2)}</span></div>
            </div>
          </div>
          {editing.notes && <div className="mt-6 text-sm text-gray-600"><p className="font-semibold">Notes</p><p>{editing.notes}</p></div>}
        </div>
      </div>
    );
  }

  if (editing) {
    const { subtotal, taxAmount, total } = calculateTotals(editing.items, editing.tax_rate);
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editing.id ? "Edit Invoice" : "New Invoice"}</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
        </div>

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
            <Label>Client Name</Label>
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
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input placeholder="Description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="bg-secondary" />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="bg-secondary" />
                </div>
                <div className="col-span-2">
                  <Input type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(i, "rate", Number(e.target.value))} className="bg-secondary" />
                </div>
                <div className="col-span-2 text-right text-sm font-medium py-2">R{Number(item.amount).toFixed(2)}</div>
                <div className="col-span-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, items: editing.items.filter((_, j) => j !== i) })} disabled={editing.items.length === 1}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
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
            <p className="text-sm text-muted-foreground">Subtotal: R{subtotal.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Tax: R{taxAmount.toFixed(2)}</p>
            <p className="text-lg font-bold">Total: R{total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="bg-secondary" rows={2} />
        </div>

        <div className="flex gap-2">
          <Button onClick={saveInvoice}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={() => setPreviewing(true)}>Preview & Download</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">R{Number(inv.total).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-900/30 text-green-400' : inv.status === 'overdue' ? 'bg-red-900/30 text-red-400' : 'bg-secondary text-muted-foreground'}`}>
                    {inv.status}
                  </span>
                </div>
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
