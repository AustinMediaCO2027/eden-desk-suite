import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthGate } from "@/components/SignInPromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UpgradeDialog from "@/components/UpgradeDialog";
import PurchaseOrderPrint from "@/components/print/PurchaseOrderPrint";
import { createPrintNode, downloadReportPdf, generateReportPdfBase64 } from "@/lib/report-pdf";
import SendAttachmentDialog from "@/components/dashboard/SendAttachmentDialog";
import {
  calculatePurchaseOrderTotals,
  emptyPurchaseOrderItem,
  nextSequentialNumber,
  purchaseOrderLineNet,
  PURCHASE_ORDER_STATUSES,
  type PurchaseOrderItem,
  type PurchaseOrderRecord,
} from "@/lib/accounting-types";
import { formatDisplayDate, formatMoney, toISODate } from "@/lib/accounting-utils";
import {
  ClipboardList,
  Copy,
  Download,
  Mail,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";

interface DraftPurchaseOrder {
  id?: string;
  po_number: string;
  supplier_name: string;
  supplier_contact: string;
  supplier_email: string;
  supplier_phone: string;
  supplier_address: string;
  supplier_vat_number: string;
  issue_date: string;
  expected_delivery_date: string;
  currency: string;
  payment_terms: string;
  notes: string;
  internal_notes: string;
  status: string;
  items: PurchaseOrderItem[];
}

const PAGE_SIZE = 10;

const emptyDraft = (poNumber: string): DraftPurchaseOrder => ({
  po_number: poNumber,
  supplier_name: "",
  supplier_contact: "",
  supplier_email: "",
  supplier_phone: "",
  supplier_address: "",
  supplier_vat_number: "",
  issue_date: toISODate(new Date()),
  expected_delivery_date: "",
  currency: "ZAR",
  payment_terms: "",
  notes: "",
  internal_notes: "",
  status: "draft",
  items: [emptyPurchaseOrderItem()],
});

const toDraft = (record: PurchaseOrderRecord): DraftPurchaseOrder => ({
  id: record.id,
  po_number: record.po_number,
  supplier_name: record.supplier_name || "",
  supplier_contact: record.supplier_contact || "",
  supplier_email: record.supplier_email || "",
  supplier_phone: record.supplier_phone || "",
  supplier_address: record.supplier_address || "",
  supplier_vat_number: record.supplier_vat_number || "",
  issue_date: record.issue_date || toISODate(new Date()),
  expected_delivery_date: record.expected_delivery_date || "",
  currency: record.currency || "ZAR",
  payment_terms: record.payment_terms || "",
  notes: record.notes || "",
  internal_notes: record.internal_notes || "",
  status: record.status || "draft",
  items: Array.isArray(record.items) && record.items.length ? record.items : [emptyPurchaseOrderItem()],
});

const PurchaseOrdersPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { canUseFeature, loading: planLoading } = useSubscription();
  const { requireAuth, gateDialog, isGuest } = useAuthGate("manage purchase orders");

  const allowed = canUseFeature("purchaseOrders");

  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<DraftPurchaseOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sendTarget, setSendTarget] = useState<PurchaseOrderRecord | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load purchase orders", description: error.message, variant: "destructive" });
    }
    setOrders((data as unknown as PurchaseOrderRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (allowed) fetchOrders();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, allowed]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesTerm =
        !term ||
        `${order.po_number} ${order.supplier_name} ${order.supplier_email || ""} ${order.notes || ""}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const draftTotals = useMemo(
    () => calculatePurchaseOrderTotals(draft?.items || []),
    [draft]
  );

  const startNew = () => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    setDraft(emptyDraft(nextSequentialNumber("PO", orders.map((order) => order.po_number))));
  };

  const updateItem = (index: number, patch: Partial<PurchaseOrderItem>) => {
    if (!draft) return;
    const items = draft.items.map((item, i) => {
      if (i !== index) return item;
      const merged = { ...item, ...patch };
      return { ...merged, amount: purchaseOrderLineNet(merged) };
    });
    setDraft({ ...draft, items });
  };

  const save = async () => {
    if (!user || !draft) return;
    if (!draft.supplier_name.trim()) {
      toast({ title: "Supplier required", description: "Enter a supplier name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const totals = calculatePurchaseOrderTotals(draft.items);
    const payload = {
      user_id: user.id,
      po_number: draft.po_number,
      supplier_name: draft.supplier_name,
      supplier_contact: draft.supplier_contact || null,
      supplier_email: draft.supplier_email || null,
      supplier_phone: draft.supplier_phone || null,
      supplier_address: draft.supplier_address || null,
      supplier_vat_number: draft.supplier_vat_number || null,
      issue_date: draft.issue_date,
      expected_delivery_date: draft.expected_delivery_date || null,
      currency: draft.currency,
      payment_terms: draft.payment_terms || null,
      notes: draft.notes || null,
      internal_notes: draft.internal_notes || null,
      items: draft.items.map((item) => ({ ...item, amount: purchaseOrderLineNet(item) })) as unknown as never,
      tax_rate: Number(draft.items[0]?.taxRate || 0),
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      tax_amount: totals.taxAmount,
      total: totals.total,
      status: draft.status,
    };

    const { error } = draft.id
      ? await supabase.from("purchase_orders").update(payload).eq("id", draft.id)
      : await supabase.from("purchase_orders").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: draft.id ? "Purchase order updated" : "Purchase order created" });
    setDraft(null);
    fetchOrders();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Purchase order deleted" });
    fetchOrders();
  };

  const duplicate = (order: PurchaseOrderRecord) => {
    const copy = toDraft(order);
    delete copy.id;
    copy.po_number = nextSequentialNumber("PO", orders.map((existing) => existing.po_number));
    copy.status = "draft";
    setDraft(copy);
  };

  const buildPrintNode = (order: PurchaseOrderRecord) =>
    createPrintNode(PurchaseOrderPrint, {
      profile,
      poNumber: order.po_number,
      issueDate: order.issue_date,
      expectedDeliveryDate: order.expected_delivery_date,
      currencySymbol: order.currency === "ZAR" ? "R" : "",
      status: order.status,
      supplierName: order.supplier_name,
      supplierContact: order.supplier_contact,
      supplierEmail: order.supplier_email,
      supplierPhone: order.supplier_phone,
      supplierAddress: order.supplier_address,
      supplierVatNumber: order.supplier_vat_number,
      paymentTerms: order.payment_terms,
      notes: order.notes,
      items: Array.isArray(order.items) ? order.items : [],
      generatedBy: profile?.company_name || user?.email || undefined,
    });

  const downloadPdf = async (order: PurchaseOrderRecord) => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    const ok = await downloadReportPdf(buildPrintNode(order), `purchase-order-${order.po_number}`, {
      footerLabel: `${profile?.company_name || "Eden Desk"} · Purchase Order ${order.po_number}`,
    });
    if (!ok) toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
  };

  const convertToExpense = async (order: PurchaseOrderRecord) => {
    if (!user) {
      requireAuth(() => {});
      return;
    }
    const { data: existing } = await supabase
      .from("expenses")
      .select("id")
      .eq("user_id", user.id)
      .eq("purchase_order_id", order.id)
      .maybeSingle();

    if (existing) {
      toast({ title: "Already converted", description: `${order.po_number} already has a linked expense.` });
      return;
    }

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      expense_number: order.po_number.replace(/^PO/, "EXP"),
      supplier_name: order.supplier_name,
      category: "Stock & Materials",
      date: toISODate(new Date()),
      description: `Converted from purchase order ${order.po_number}`,
      subtotal: Number(order.subtotal || 0),
      tax_amount: Number(order.tax_amount || 0),
      total: Number(order.total || 0),
      reference: order.po_number,
      purchase_order_id: order.id,
    });

    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("purchase_orders").update({ status: "completed" }).eq("id", order.id);
    toast({ title: "Expense created", description: `${order.po_number} recorded as an expense.` });
    fetchOrders();
  };

  if (!planLoading && !allowed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Purchase Orders are a Silver feature</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Issue professional purchase orders to suppliers, email them with a PDF attached, and convert them into
            expenses for your accounting reports.
          </p>
          <Button className="mt-5" onClick={() => setShowUpgrade(true)}>
            Upgrade to unlock
          </Button>
        </div>
        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="Purchase Orders" requiredPlan="Silver" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gateDialog}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={startNew}>
          <Plus className="mr-1 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      {draft && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{draft.id ? `Edit ${draft.po_number}` : `New ${draft.po_number}`}</h2>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Supplier name *</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_name}
                onChange={(e) => setDraft({ ...draft, supplier_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contact person</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_contact}
                onChange={(e) => setDraft({ ...draft, supplier_contact: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Supplier email</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_email}
                onChange={(e) => setDraft({ ...draft, supplier_email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Supplier phone</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_phone}
                onChange={(e) => setDraft({ ...draft, supplier_phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Supplier VAT number</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_vat_number}
                onChange={(e) => setDraft({ ...draft, supplier_vat_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Supplier address</Label>
              <Input
                className="bg-secondary"
                value={draft.supplier_address}
                onChange={(e) => setDraft({ ...draft, supplier_address: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">PO number</Label>
              <Input
                className="bg-secondary"
                value={draft.po_number}
                onChange={(e) => setDraft({ ...draft, po_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Issue date</Label>
              <Input
                type="date"
                className="bg-secondary"
                value={draft.issue_date}
                onChange={(e) => setDraft({ ...draft, issue_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expected delivery</Label>
              <Input
                type="date"
                className="bg-secondary"
                value={draft.expected_delivery_date}
                onChange={(e) => setDraft({ ...draft, expected_delivery_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value })}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Input
                className="bg-secondary"
                value={draft.currency}
                onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-3">
              <Label className="text-xs">Payment terms</Label>
              <Input
                className="bg-secondary"
                placeholder="e.g. 30 days from invoice date"
                value={draft.payment_terms}
                onChange={(e) => setDraft({ ...draft, payment_terms: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Line items</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft({ ...draft, items: [...draft.items, emptyPurchaseOrderItem()] })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add line
              </Button>
            </div>

            {draft.items.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 md:grid-cols-12">
                <div className="col-span-2 space-y-1 md:col-span-3">
                  <Label className="text-[10px] text-muted-foreground">Product / Service</Label>
                  <Input
                    className="bg-secondary"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-1 md:col-span-3">
                  <Label className="text-[10px] text-muted-foreground">Description</Label>
                  <Input
                    className="bg-secondary"
                    value={item.details}
                    onChange={(e) => updateItem(index, { details: e.target.value })}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-[10px] text-muted-foreground">Qty</Label>
                  <Input
                    type="number"
                    className="bg-secondary"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[10px] text-muted-foreground">Unit price</Label>
                  <Input
                    type="number"
                    className="bg-secondary"
                    value={item.rate}
                    onChange={(e) => updateItem(index, { rate: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-[10px] text-muted-foreground">Disc %</Label>
                  <Input
                    type="number"
                    className="bg-secondary"
                    value={item.discount}
                    onChange={(e) => updateItem(index, { discount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-[10px] text-muted-foreground">Tax %</Label>
                  <Input
                    type="number"
                    className="bg-secondary"
                    value={item.taxRate}
                    onChange={(e) => updateItem(index, { taxRate: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end justify-between gap-2 md:col-span-1">
                  <span className="text-xs font-semibold tabular-nums">{formatMoney(purchaseOrderLineNet(item))}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        items: draft.items.length > 1 ? draft.items.filter((_, i) => i !== index) : draft.items,
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Notes (visible to supplier)</Label>
              <Textarea
                rows={3}
                className="bg-secondary"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Internal notes (private)</Label>
              <Textarea
                rows={3}
                className="bg-secondary"
                value={draft.internal_notes}
                onChange={(e) => setDraft({ ...draft, internal_notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Subtotal </span>
              <span className="font-semibold tabular-nums">{formatMoney(draftTotals.subtotal)}</span>
              <span className="ml-4 text-muted-foreground">VAT </span>
              <span className="font-semibold tabular-nums">{formatMoney(draftTotals.taxAmount)}</span>
              <span className="ml-4 text-muted-foreground">Total </span>
              <span className="font-bold tabular-nums">{formatMoney(draftTotals.total)}</span>
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Purchase Order"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          placeholder="Search by PO number or supplier..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-secondary"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="bg-secondary md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PURCHASE_ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading purchase orders...</p>
        ) : paged.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm font-medium">No purchase orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first purchase order to send to a supplier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="p-3 font-medium">{order.po_number}</td>
                    <td className="p-3">{order.supplier_name}</td>
                    <td className="p-3">{formatDisplayDate(order.issue_date)}</td>
                    <td className="p-3 capitalize">{order.status}</td>
                    <td className="p-3 text-right tabular-nums">{formatMoney(Number(order.total || 0))}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button variant="ghost" size="sm" title="Edit" onClick={() => setDraft(toDraft(order))}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Duplicate" onClick={() => duplicate(order)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download PDF" onClick={() => downloadPdf(order)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Email supplier"
                          onClick={() => (isGuest ? requireAuth(() => {}) : setSendTarget(order))}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Convert to expense"
                          onClick={() => convertToExpense(order)}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete" onClick={() => remove(order.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {sendTarget && (
        <SendAttachmentDialog
          title={`Email ${sendTarget.po_number}`}
          profile={profile}
          defaultTo={sendTarget.supplier_email || ""}
          defaultSubject={`Purchase Order ${sendTarget.po_number} from ${profile?.company_name || "us"}`}
          defaultMessage={`Hi ${sendTarget.supplier_contact || sendTarget.supplier_name},\n\nPlease find attached purchase order ${sendTarget.po_number}.\n\nKind regards,\n${profile?.company_name || ""}`}
          filename={`purchase-order-${sendTarget.po_number}`}
          buildPdf={() =>
            generateReportPdfBase64(buildPrintNode(sendTarget), {
              footerLabel: `${profile?.company_name || "Eden Desk"} · Purchase Order ${sendTarget.po_number}`,
            })
          }
          onClose={() => setSendTarget(null)}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
