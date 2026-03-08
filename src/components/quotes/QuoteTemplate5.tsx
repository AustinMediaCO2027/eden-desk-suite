import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";
import type { QuoteTemplateProps } from "./QuoteTemplate1";

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "#fdfcfb", color: "#1a1a1a",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums lining-nums", fontFeatureSettings: '"tnum" 1, "lnum" 1' };

/**
 * Quote Template 5 – Bold Minimalist
 * Black header band, large "QUOTATION" title, monogram logo,
 * clean grid layout, black totals band, minimal footer.
 * Based on the Canva "Black and White Bold Minimalist Commercial Invoice" design.
 */
const QuoteTemplate5 = forwardRef<HTMLDivElement, QuoteTemplateProps>(
  ({ profile, documentNumber, date, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#000000";
    const limitedItems = items.slice(0, 10);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    // Generate monogram from company name
    const companyName = safeText(profile?.company_name, 50) || "Company";
    const monogram = companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
      <div ref={ref} style={PAGE} data-print-template="quote" data-template-style="template5">
        {/* ── Black header band ── */}
        <div style={{
          backgroundColor: accent,
          padding: "12mm 20mm 10mm",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody><tr>
              <td style={{ verticalAlign: "top" }}>
                <p style={{
                  margin: 0, fontSize: "14mm", fontWeight: 800,
                  color: "white", letterSpacing: "2mm", lineHeight: 1,
                  textTransform: "uppercase",
                }}>Quotation</p>
                <p style={{ margin: "3mm 0 0", fontSize: "3.2mm", color: "rgba(255,255,255,0.6)", letterSpacing: "0.5mm" }}>
                  {safeText(profile?.company_name, 50) || "Your Company"}
                </p>
              </td>
              <td style={{ verticalAlign: "top", textAlign: "right" }}>
                {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    style={{ maxHeight: "18mm", maxWidth: "30mm", objectFit: "contain" }}
                  />
                ) : (
                  <table style={{ borderCollapse: "collapse", marginLeft: "auto" }}>
                    <tbody><tr><td style={{
                      width: "16mm", height: "16mm",
                      border: "0.6mm solid rgba(255,255,255,0.8)",
                      textAlign: "center", verticalAlign: "middle",
                      fontSize: "7mm", fontWeight: 800, color: "white",
                      letterSpacing: "0.5mm",
                    }}>
                      {monogram}
                    </td></tr></tbody>
                  </table>
                )}
              </td>
            </tr></tbody>
          </table>
        </div>

        {/* ── Body content ── */}
        <div style={{ padding: "8mm 20mm 20mm" }}>

          {/* Quote metadata row */}
          <table style={{ ...T, marginBottom: "6mm" }}>
            <tbody>
              <tr>
                <td style={{ width: "33%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", color: "#999" }}>Quote Number</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.4mm", fontWeight: 600 }}>{safeText(documentNumber, 20)}</p>
                </td>
                <td style={{ width: "33%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", color: "#999" }}>Date</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.4mm", fontWeight: 600 }}>{safeText(date, 30)}</p>
                </td>
                <td style={{ width: "34%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", color: "#999" }}>Valid Until</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.4mm", fontWeight: 600 }}>30 Days</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Divider */}
          <div style={{ borderBottom: "0.4mm solid #1a1a1a", marginBottom: "6mm" }} />

          {/* TO / FROM */}
          <table style={{ ...T, marginBottom: "7mm" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.8mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm" }}>To:</p>
                  <p style={{ margin: "1.5mm 0 0", fontSize: "3.4mm", fontWeight: 700 }}>{safeText(clientName, 60)}</p>
                  {clientAddress && <p style={{ margin: "1mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 120)}</p>}
                  {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.9mm", color: "#555" }}>{safeText(clientEmail, 60)}</p>}
                </td>
                <td style={{ width: "50%", verticalAlign: "top", textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "2.8mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm" }}>From:</p>
                  <p style={{ margin: "1.5mm 0 0", fontSize: "3.4mm", fontWeight: 700 }}>{companyName}</p>
                  {profile?.company_address && <p style={{ margin: "1mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 120)}</p>}
                  {profile?.company_email && <p style={{ margin: "0.5mm 0 0", fontSize: "2.9mm", color: "#555" }}>{safeText(profile.company_email, 60)}</p>}
                  {profile?.company_phone && <p style={{ margin: "0.5mm 0 0", fontSize: "2.9mm", color: "#555" }}>{safeText(profile.company_phone, 40)}</p>}
                  {profile?.registration_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#999" }}>Reg: {safeText(profile.registration_number, 30)}</p>}
                  {profile?.vat_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#999" }}>VAT: {safeText(profile.vat_number, 30)}</p>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section title */}
          <p style={{ margin: "0 0 3mm", fontSize: "3.2mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4mm" }}>
            Service Description
          </p>

          {/* Items table */}
          <table style={{ ...T, marginBottom: "5mm" }}>
            <thead>
              <tr style={{ borderBottom: "0.5mm solid #1a1a1a" }}>
                <th style={{ width: "48%", textAlign: "left", fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", padding: "2.5mm 0" }}>Item</th>
                <th style={{ width: "12%", textAlign: "center", fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", padding: "2.5mm 0" }}>Qty</th>
                <th style={{ width: "20%", textAlign: "right", fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", padding: "2.5mm 0" }}>Unit Price</th>
                <th style={{ width: "20%", textAlign: "right", fontSize: "2.6mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm", padding: "2.5mm 0" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {norm.map((item, i) => (
                <tr key={i} style={{ borderBottom: "0.2mm solid #e0e0e0", pageBreakInside: "avoid" }}>
                  <td style={{ padding: "2.5mm 0", verticalAlign: "top" }}>
                    <p style={{ margin: 0, fontSize: "3mm", fontWeight: 500 }}>{safeText(item.description, 70)}</p>
                    {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.5mm", color: "#888" }}>{safeText(item.details, 80)}</p>}
                  </td>
                  <td style={{ padding: "2.5mm 0", textAlign: "center", fontSize: "3mm", color: "#444" }}>{Number(item.quantity || 0)}</td>
                  <td style={{ ...R, padding: "2.5mm 0", fontSize: "3mm", color: "#444" }}>{fmt(Number(item.rate || 0))}</td>
                  <td style={{ ...R, padding: "2.5mm 0", fontSize: "3mm", fontWeight: 600 }}>{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <table style={{ ...T, marginBottom: "6mm" }}>
            <tbody>
              <tr><td style={{ width: "55%" }} /><td style={{ width: "45%" }}>
                <table style={T}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: "3mm", fontWeight: 600, textTransform: "uppercase", padding: "1.5mm 0", textAlign: "right" }}>Subtotal</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0", paddingLeft: "8mm" }}>{fmt(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "3mm", fontWeight: 600, textTransform: "uppercase", padding: "1.5mm 0", textAlign: "right" }}>Tax ({taxRate}%)</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0", paddingLeft: "8mm" }}>{fmt(taxAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ paddingTop: "2mm" }}>
                        <div style={{
                          backgroundColor: accent,
                          padding: "3mm 4mm",
                        }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody><tr>
                              <td style={{ fontSize: "3.5mm", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.3mm", textAlign: "left" }}>Total Estimate</td>
                              <td style={{ fontSize: "4mm", fontWeight: 800, color: "white", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</td>
                            </tr></tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td></tr>
            </tbody>
          </table>

          {/* Notes */}
          {notes && (
            <div style={{ marginBottom: "4mm" }}>
              <p style={{ margin: 0, fontSize: "2.8mm", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3mm" }}>Notes</p>
              <p style={{ margin: "1.5mm 0 0", fontSize: "2.8mm", color: "#555", whiteSpace: "pre-wrap", maxHeight: "14mm", overflow: "hidden" }}>{safeText(notes, 200)}</p>
            </div>
          )}
        </div>

        {/* ── Footer band ── */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          backgroundColor: accent,
          padding: "4mm 20mm",
          textAlign: "center",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody><tr>
              {profile?.company_phone && (
                <td style={{ fontSize: "2.8mm", color: "white", textAlign: "center" }}>📞 {safeText(profile.company_phone, 30)}</td>
              )}
              {profile?.company_email && (
                <td style={{ fontSize: "2.8mm", color: "white", textAlign: "center" }}>✉ {safeText(profile.company_email, 50)}</td>
              )}
              {profile?.company_website && (
                <td style={{ fontSize: "2.8mm", color: "white", textAlign: "center" }}>🌐 {safeText(profile.company_website, 50)}</td>
              )}
            </tr></tbody>
          </table>
        </div>
      </div>
    );
  }
);

QuoteTemplate5.displayName = "QuoteTemplate5";
export default QuoteTemplate5;
