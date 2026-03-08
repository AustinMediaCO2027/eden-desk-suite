import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";

export interface QuoteTemplateProps {
  profile: Profile | null;
  documentNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  status: string;
  colorOverride?: string;
}

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm", padding: "16mm 20mm 20mm",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "white", color: "#1a1a1a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

/**
 * Quote Template 1 – Executive / Freelancer
 * Mirrors InvoiceTemplate1: warm accent, logo+company top-left, big total top-right,
 * rounded card for billing/meta, items table, notes, terms footer.
 */
const QuoteTemplate1 = forwardRef<HTMLDivElement, QuoteTemplateProps>(
  ({ profile, documentNumber, date, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#e8590c";
    const limitedItems = items.slice(0, 9);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="quote" data-template-style="template1">
        {/* Header: Logo+Company left, Company address right */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "55%", verticalAlign: "top" }}>
                <table style={{ borderCollapse: "collapse", marginBottom: "2mm" }}>
                  <tbody>
                    <tr>
                      {profile?.logo_url && (
                        <td style={{ verticalAlign: "middle", paddingRight: "3mm" }}>
                          <img src={profile.logo_url} alt="Logo" style={{ height: "12mm", maxWidth: "30mm", objectFit: "contain" }} />
                        </td>
                      )}
                      <td style={{ verticalAlign: "middle" }}>
                        <p style={{ margin: 0, fontSize: "5mm", fontWeight: 700, color: accent }}>{safeText(profile?.company_name, 60) || "Your Company"}</p>
                        {profile?.company_website && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#666" }}>{safeText(profile.company_website, 60)}</p>}
                        {profile?.company_email && <p style={{ margin: "0.3mm 0 0", fontSize: "2.8mm", color: "#666" }}>{safeText(profile.company_email, 60)}</p>}
                        {profile?.company_phone && <p style={{ margin: "0.3mm 0 0", fontSize: "2.8mm", color: "#666" }}>{safeText(profile.company_phone, 40)}</p>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ width: "45%", verticalAlign: "top", textAlign: "right" }}>
                {profile?.company_address && <p style={{ margin: 0, fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 120)}</p>}
                {profile?.vat_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#888" }}>TAX ID {safeText(profile.vat_number, 40)}</p>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Billing card */}
        <div style={{ border: "0.3mm solid #e5e7eb", borderRadius: "3mm", padding: "5mm 6mm", marginBottom: "5mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "38%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", textTransform: "uppercase", letterSpacing: "0.2mm" }}>Prepared for</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.4mm", fontWeight: 600 }}>{safeText(clientName, 80)}</p>
                  {clientAddress && <p style={{ margin: "0.8mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 120)}</p>}
                  {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>{safeText(clientEmail, 60)}</p>}
                </td>
                <td style={{ width: "30%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888" }}>Quote number</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>#{safeText(documentNumber, 30)}</p>
                  <p style={{ margin: "3mm 0 0", fontSize: "2.6mm", color: "#888" }}>Date</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(date, 30)}</p>
                </td>
                <td style={{ width: "32%", verticalAlign: "top" }}>
                  <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "3mm 4mm", textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "2.6mm", color: "rgba(255,255,255,0.7)" }}>Estimated total (ZAR)</p>
                    <p style={{ margin: "1mm 0 0", fontSize: "6.5mm", fontWeight: 700, color: "white" }}>{fmt(total)}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: "0.3mm solid #e5e7eb", marginBottom: "3mm" }} />

        {/* Items table */}
        <table style={{ ...T, marginBottom: "4mm" }}>
          <thead>
            <tr>
              <th style={{ width: "50%", textAlign: "left", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Item Detail</th>
              <th style={{ width: "14%", textAlign: "center", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Qty</th>
              <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Rate</th>
              <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {norm.map((item, i) => (
              <tr key={i} style={{ pageBreakInside: "avoid" }}>
                <td style={{ padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "3.2mm", fontWeight: 600 }}>{safeText(item.description, 70)}</p>
                  {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.7mm", color: "#888" }}>{safeText(item.details, 80)}</p>}
                </td>
                <td style={{ ...R, textAlign: "center", padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3.1mm", color: "#555" }}>{Number(item.quantity || 0)}</td>
                <td style={{ ...R, padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3.1mm", color: "#555" }}>{fmt(Number(item.rate || 0))}</td>
                <td style={{ ...R, padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3.1mm", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "60%" }} />
              <td style={{ width: "40%" }}>
                <table style={T}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Subtotal</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Tax ({taxRate}%)</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(taxAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: "2.5mm 0 0" }}>
                        <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "2.5mm 4mm" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody><tr>
                              <td style={{ fontSize: "3.5mm", fontWeight: 700, color: "white", textAlign: "left" }}>Total</td>
                              <td style={{ fontSize: "3.5mm", fontWeight: 700, color: "white", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</td>
                            </tr></tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "20mm" }}>
          {notes && (
            <div style={{ marginBottom: "3mm" }}>
              <p style={{ margin: 0, fontSize: "2.6mm", color: accent, fontWeight: 600 }}>Terms & Conditions</p>
              <p style={{ margin: "1mm 0 0", fontSize: "2.7mm", color: "#888", whiteSpace: "pre-wrap", maxHeight: "12mm", overflow: "hidden" }}>{safeText(notes, 200)}</p>
            </div>
          )}
          <div style={{ borderTop: "0.3mm solid #e5e7eb", paddingTop: "3mm" }}>
            <table style={T}>
              <tbody>
                <tr>
                  <td style={{ fontSize: "2.8mm", color: "#888" }}>{safeText(profile?.company_website, 60)}</td>
                  <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "center" }}>{safeText(profile?.company_phone, 40)}</td>
                  <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "right" }}>{safeText(profile?.company_email, 60)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

QuoteTemplate1.displayName = "QuoteTemplate1";
export default QuoteTemplate1;
