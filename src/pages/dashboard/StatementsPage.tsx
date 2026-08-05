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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UpgradeDialog from "@/components/UpgradeDialog";
import SendAttachmentDialog from "@/components/dashboard/SendAttachmentDialog";
import StatementPrint from "@/components/print/StatementPrint";
import { createPrintNode, downloadReportPdf, generateReportPdfBase64 } from "@/lib/report-pdf";
import { buildClientStatement, type StatementInvoice } from "@/lib/statements";
import type { CreditNoteRecord, PaymentRecord } from "@/lib/accounting-types";
import {
  DATE_RANGE_PRESETS,
  formatDisplayDate,
  formatMoney,
  resolveDateRange,
  toISODate,
  type DateRangePreset,
} from "@/lib/accounting-utils";
import { Download, FileText, Mail } from "lucide-react";

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
}

const StatementsPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { canUseFeature, loading: planLoading } = useSubscription();
  const { requireAuth, gateDialog, isGuest } = useAuthGate("generate client statements");

  const allowed = canUseFeature("clientStatements");

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [invoices, setInvoices] = useState<StatementInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteRecord[]>([]);
  const [clientName, setClientName] = useState("");
  const [preset, setPreset] = useState<DateRangePreset>("this_year");
  const [customFrom, setCustomFrom] = useState(toISODate(new Date()));
  const [customTo, setCustomTo] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !allowed) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [clientsRes, invoicesRes, paymentsRes, creditsRes] = await Promise.all([
        supabase.from("clients").select("id, name, email, address").eq("user_id", user.id).order("name"),
        supabase
          .from("invoices")
          .select("id, invoice_number, client_name, date, due_date, total, status")
          .eq("user_id", user.id),
        supabase.from("payments").select("*").eq("user_id", user.id),
        supabase.from("credit_notes").select("*").eq("user_id", user.id),
      ]);

      setClients((clientsRes.data as ClientOption[]) || []);
      setInvoices((invoicesRes.data as StatementInvoice[]) || []);
      setPayments((paymentsRes.data as unknown as PaymentRecord[]) || []);
      setCreditNotes((creditsRes.data as unknown as CreditNoteRecord[]) || []);
      setLoading(false);
    };
    load();
  }, [user, allowed]);

  const invoiceClientNames = useMemo(() => {
    const names = new Set<string>();
    clients.forEach((client) => client.name && names.add(client.name));
    invoices.forEach((invoice) => invoice.client_name && names.add(invoice.client_name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [clients, invoices]);

  const range = useMemo(
    () => resolveDateRange(preset, { from: customFrom, to: customTo }),
    [preset, customFrom, customTo]
  );

  const statement = useMemo(
    () => buildClientStatement({ invoices, payments, creditNotes }, clientName, range),
    [invoices, payments, creditNotes, clientName, range]
  );

  const selectedClient = clients.find((client) => client.name === clientName) || null;

  const printNode = () =>
    createPrintNode(StatementPrint, {
      profile,
      clientName,
      clientEmail: selectedClient?.email,
      clientAddress: selectedClient?.address,
      fromDate: range.from,
      toDate: range.to,
      statement,
      generatedBy: profile?.company_name || user?.email || undefined,
    });

  const handleDownload = async () => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    if (!clientName) {
      toast({ title: "Select a client", description: "Choose a client to generate a statement.", variant: "destructive" });
      return;
    }
    const ok = await downloadReportPdf(printNode(), `statement-${clientName}-${range.from}-${range.to}`, {
      footerLabel: `${profile?.company_name || "Eden Desk"} · Statement for ${clientName}`,
    });
    if (!ok) toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
  };

  if (!planLoading && !allowed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Client Statements</h1>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Client Statements are a Silver feature</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Produce running-balance statements with opening balance, invoices, payments and credit notes — then email
            them straight to your client.
          </p>
          <Button className="mt-5" onClick={() => setShowUpgrade(true)}>
            Upgrade to unlock
          </Button>
        </div>
        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="Client Statements" requiredPlan="Silver" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gateDialog}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Client Statements</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Client</Label>
          <Select value={clientName} onValueChange={setClientName}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {invoiceClientNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Period</Label>
          <Select value={preset} onValueChange={(value) => setPreset(value as DateRangePreset)}>
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_PRESETS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date from</Label>
          <Input
            type="date"
            className="bg-secondary"
            value={preset === "custom" ? customFrom : range.from}
            disabled={preset !== "custom"}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date to</Label>
          <Input
            type="date"
            className="bg-secondary"
            value={preset === "custom" ? customTo : range.to}
            disabled={preset !== "custom"}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} disabled={!clientName}>
          <Download className="mr-1 h-4 w-4" /> Download PDF
        </Button>
        <Button
          variant="outline"
          disabled={!clientName}
          onClick={() => (isGuest ? requireAuth(() => {}) : setSending(true))}
        >
          <Mail className="mr-1 h-4 w-4" /> Email statement
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading statement data...</p>
        ) : !clientName ? (
          <p className="p-6 text-sm text-muted-foreground">Select a client to preview their statement.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Debit</th>
                  <th className="p-3 text-right">Credit</th>
                  <th className="p-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60 bg-muted/40">
                  <td className="p-3">{formatDisplayDate(range.from)}</td>
                  <td className="p-3 font-medium" colSpan={3}>
                    Opening Balance
                  </td>
                  <td className="p-3 text-right">—</td>
                  <td className="p-3 text-right">—</td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {formatMoney(statement.openingBalance)}
                  </td>
                </tr>
                {statement.lines.map((line, index) => (
                  <tr key={`${line.type}-${line.reference}-${index}`} className="border-b border-border/60">
                    <td className="p-3">{formatDisplayDate(line.date)}</td>
                    <td className="p-3">{line.type}</td>
                    <td className="p-3">{line.reference}</td>
                    <td className="p-3">{line.description}</td>
                    <td className="p-3 text-right tabular-nums">{line.debit ? formatMoney(line.debit) : "—"}</td>
                    <td className="p-3 text-right tabular-nums">{line.credit ? formatMoney(line.credit) : "—"}</td>
                    <td className="p-3 text-right font-medium tabular-nums">{formatMoney(line.balance)}</td>
                  </tr>
                ))}
                {statement.lines.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-muted-foreground" colSpan={7}>
                      No transactions in this period.
                    </td>
                  </tr>
                )}
                <tr className="bg-muted/60">
                  <td className="p-3 font-semibold" colSpan={6}>
                    Closing Balance
                  </td>
                  <td className="p-3 text-right font-bold tabular-nums">{formatMoney(statement.closingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sending && (
        <SendAttachmentDialog
          title={`Email statement to ${clientName}`}
          profile={profile}
          defaultTo={selectedClient?.email || ""}
          defaultSubject={`Statement of account — ${clientName}`}
          defaultMessage={`Hi ${clientName},\n\nPlease find attached your statement of account for the period ${formatDisplayDate(range.from)} to ${formatDisplayDate(range.to)}. The closing balance is ${formatMoney(statement.closingBalance)}.\n\nKind regards,\n${profile?.company_name || ""}`}
          filename={`statement-${clientName}`}
          buildPdf={() =>
            generateReportPdfBase64(printNode(), {
              footerLabel: `${profile?.company_name || "Eden Desk"} · Statement for ${clientName}`,
            })
          }
          onClose={() => setSending(false)}
        />
      )}
    </div>
  );
};

export default StatementsPage;
