import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";
import type { InvoiceTemplateProps } from "./InvoiceTemplate1";

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm", padding: "18mm 20mm 20mm",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "white", color: "#1a1a1a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

/**
 * Template 5 – Corporate Clean
 * Based on Blocks Design Studio reference: Logo top-left, bold "INVOICE" top-right,
 * company details right-aligned, client right-aligned, metadata centered,
 * bordered items table with GST column, totals box, payment instructions footer.
 */
const InvoiceTemplate5 = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#1e293b";
    const limitedItems = items.slice(0, 9);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="invoice" data-template-style="template5">
        {/* Header: Logo left, INVOICE + Company right */}
        <table style={{ ...T, marginBottom: "8mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "40%", verticalAlign: "top" }}>
                {profile?.logo_url && (
                  <img src={profile.logo_url} alt="Logo" style={{ height: "14mm", maxWidth: "40mm", objectFit: "contain" }} />
                )}
              </td>
              <td style={{ width: "60%", verticalAlign: "top", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "7mm", fontWeight: 800, color: accent, letterSpacing: "0.3mm" }}>INVOICE</p>
                <p style={{ margin: "3mm 0 0", fontSize: "3.6mm", fontWeight: 700, color: accent }}>{safeText(profile?.company_name, 60) || "Your Company"}</p>
                {profile?.registration_number && <p style={{ margin: "1mm 0 0", fontSize: "2.8mm", color: "#666" }}>REG: {safeText(profile.registration_number, 40)}</p>}
                <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#666" }}>
                  {[safeText(profile?.company_email, 50), safeText(profile?.company_phone, 30)].filter(Boolean).join(" | ")}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Client name + Invoice metadata */}
        <table style={{ ...T, marginBottom: "7mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top" }} />
              <td style={{ width: "50%", verticalAlign: "top", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "3.8mm", fontWeight: 700, color: accent }}>{safeText(clientName, 60)}</p>
                {clientAddress && <p style={{ margin: "0.8mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 120)}</p>}
                {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>{safeText(clientEmail, 60)}</p>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Invoice metadata row */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top" }} />
              <td style={{ width: "50%", verticalAlign: "top" }}>
                <table style={T}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: "2.9mm", color: "#888", padding: "1mm 0", fontWeight: 600 }}>INVOICE NUMBER:</td>
                      <td style={{ ...R, fontSize: "2.9mm", padding: "1mm 0" }}>{safeText(documentNumber, 30)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "2.9mm", color: "#888", padding: "1mm 0", fontWeight: 600 }}>INVOICE DATE:</td>
                      <td style={{ ...R, fontSize: "2.9mm", padding: "1mm 0" }}>{safeText(date, 30)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "2.9mm", color: "#888", padding: "1mm 0", fontWeight: 600 }}>DUE:</td>
                      <td style={{ ...R, fontSize: "2.9mm", padding: "1mm 0" }}>{safeText(dueDate, 30)}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items table with border */}
        <div style={{ border: "0.3mm solid #e5e7eb", borderRadius: "2mm", overflow: "hidden", marginBottom: "5mm" }}>
          <table style={T}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fb" }}>
                <th style={{ width: "44%", textAlign: "left", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 4mm", borderBottom: "0.3mm solid #e5e7eb" }}>Description</th>
                <th style={{ width: "10%", textAlign: "center", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 2mm", borderBottom: "0.3mm solid #e5e7eb" }}>Qty</th>
                <th style={{ width: "17%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 2mm", borderBottom: "0.3mm solid #e5e7eb" }}>Price</th>
                <th style={{ width: "12%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 2mm", borderBottom: "0.3mm solid #e5e7eb" }}>Tax</th>
                <th style={{ width: "17%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 4mm", borderBottom: "0.3mm solid #e5e7eb" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {norm.map((item, i) => {
                const itemTax = item.amount * (taxRate / 100);
                return (
                  <tr key={i} style={{ pageBreakInside: "avoid" }}>
                    <td style={{ padding: "3.5mm 4mm", borderBottom: "0.2mm solid #f0f0f0", verticalAlign: "top" }}>
                      <p style={{ margin: 0, fontSize: "3.1mm", color: "#555" }}>{safeText(item.description, 60)}</p>
                      {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#999" }}>{safeText(item.details, 70)}</p>}
                    </td>
                    <td style={{ ...R, textAlign: "center", padding: "3.5mm 2mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{Number(item.quantity || 0)}</td>
                    <td style={{ ...R, padding: "3.5mm 2mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{fmt(Number(item.rate || 0))}</td>
                    <td style={{ ...R, padding: "3.5mm 2mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{fmt(itemTax)}</td>
                    <td style={{ ...R, padding: "3.5mm 4mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#1a1a1a" }}>{fmt(item.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals box */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "55%" }} />
              <td style={{ width: "45%" }}>
                <div style={{ border: "0.3mm solid #e5e7eb", borderRadius: "2mm", padding: "3mm 4mm" }}>
                  <table style={T}>
                    <tbody>
                      <tr>
                        <td style={{ fontSize: "3mm", color: "#555", padding: "1.5mm 0" }}>Sub total (excl. Tax)</td>
                        <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "3mm", color: "#555", padding: "1.5mm 0" }}>Total Tax:</td>
                        <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(taxAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ borderTop: "0.3mm solid #e5e7eb", padding: "1mm 0" }} />
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ padding: "1mm 0 0" }}>
                          <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "2.5mm 4mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "3.3mm", fontWeight: 700, color: "white" }}>Amount due on {safeText(dueDate, 30)}:</span>
                            <span style={{ fontSize: "3.3mm", fontWeight: 700, color: "white" }}>{fmt(total)}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer: Payment instructions */}
        <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "20mm" }}>
          <div style={{ borderTop: "0.3mm solid #e5e7eb", paddingTop: "4mm" }}>
            <p style={{ margin: 0, fontSize: "2.8mm", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.2mm", marginBottom: "2mm" }}>Payment Instructions</p>
            <table style={T}>
              <tbody>
                <tr>
                  <td style={{ width: "55%", verticalAlign: "top" }}>
                    <p style={{ margin: 0, fontSize: "2.8mm", color: "#555" }}>{safeText(profile?.company_name, 60)}</p>
                    {profile?.bank_name && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>Bank name: {safeText(profile.bank_name, 40)}</p>}
                    {profile?.bank_branch_code && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>Branch code: {safeText(profile.bank_branch_code, 30)}</p>}
                    {profile?.bank_account_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>Account number: {safeText(profile.bank_account_number, 30)}</p>}
                    <p style={{ margin: "1mm 0 0", fontSize: "2.8mm", fontWeight: 600, color: accent }}>Please use as {safeText(documentNumber, 30)} as a reference number</p>
                  </td>
                  <td style={{ width: "45%", verticalAlign: "top", textAlign: "right" }}>
                    {notes && <p style={{ margin: 0, fontSize: "2.7mm", color: "#888", whiteSpace: "pre-wrap", maxHeight: "12mm", overflow: "hidden" }}>{safeText(notes, 160)}</p>}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ margin: "3mm 0 0", fontSize: "2.7mm", color: "#888" }}>
              For any questions please contact us at {safeText(profile?.company_email, 60)}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate5.displayName = "InvoiceTemplate5";
export default InvoiceTemplate5;
