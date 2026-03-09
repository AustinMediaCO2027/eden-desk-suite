import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";
import type { InvoiceTemplateProps } from "./InvoiceTemplate1";

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm", padding: "0",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "#fefff8", color: "#1a1a1a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = {
  textAlign: "right",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

/**
 * Template 7 – Natural / Canva-Inspired
 * Olive/sage header band with logo + "INVOICE" title, warm off-white background,
 * colored table header row, clean items, payment info + terms footer with signature line.
 */
const InvoiceTemplate7 = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#757b51";
    const limitedItems = items.slice(0, 8);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="invoice" data-template-style="template7">
        {/* Top thin accent bar */}
        <div style={{ height: "4mm", backgroundColor: accent }} />

        {/* Header band */}
        <div style={{ backgroundColor: accent, padding: "8mm 20mm 8mm", marginBottom: "0" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "55%", verticalAlign: "middle" }}>
                  <table style={{ borderCollapse: "collapse" }}>
                    <tbody><tr>
                      {profile?.logo_url && (
                        <td style={{ verticalAlign: "middle", paddingRight: "3mm" }}>
                          <img src={profile.logo_url} alt="Logo" style={{ height: "14mm", maxWidth: "35mm", objectFit: "contain" }} />
                        </td>
                      )}
                      <td style={{ verticalAlign: "middle" }}>
                        <p style={{ margin: 0, fontSize: "4.5mm", fontWeight: 700, color: "white", letterSpacing: "0.2mm" }}>
                          {safeText(profile?.company_name, 60) || "Your Company"}
                        </p>
                        {profile?.company_website && (
                          <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "rgba(255,255,255,0.75)" }}>
                            {safeText(profile.company_website, 50)}
                          </p>
                        )}
                      </td>
                    </tr></tbody>
                  </table>
                </td>
                <td style={{ width: "45%", verticalAlign: "middle", textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "9mm", fontWeight: 800, color: "white", letterSpacing: "0.5mm" }}>INVOICE</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Content area */}
        <div style={{ padding: "6mm 20mm 16mm" }}>
          {/* Date / Invoice # left — Invoice To right */}
          <table style={{ ...T, marginBottom: "6mm" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>Date:</p>
                  <p style={{ margin: "0.8mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(date, 30)}</p>
                  <p style={{ margin: "2mm 0 0", fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>Invoice # {safeText(documentNumber, 30)}</p>
                  {dueDate && (
                    <>
                      <p style={{ margin: "2mm 0 0", fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>Due date:</p>
                      <p style={{ margin: "0.8mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(dueDate, 30)}</p>
                    </>
                  )}
                </td>
                <td style={{ width: "50%", verticalAlign: "top", textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>Invoice To:</p>
                  <p style={{ margin: "1mm 0 0", fontSize: "3.6mm", fontWeight: 700, color: "#333" }}>{safeText(clientName, 60)}</p>
                  {clientAddress && <p style={{ margin: "0.6mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 120)}</p>}
                  {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>{safeText(clientEmail, 60)}</p>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items table */}
          <table style={{ ...T, marginBottom: "4mm" }}>
            <thead>
              <tr>
                <th style={{ width: "48%", textAlign: "left", fontSize: "2.8mm", fontWeight: 700, color: "white", backgroundColor: accent, padding: "3mm 4mm", textTransform: "uppercase", letterSpacing: "0.3mm" }}>Item Description</th>
                <th style={{ width: "17%", textAlign: "right", fontSize: "2.8mm", fontWeight: 700, color: "white", backgroundColor: accent, padding: "3mm 4mm", textTransform: "uppercase", letterSpacing: "0.3mm" }}>Price</th>
                <th style={{ width: "12%", textAlign: "right", fontSize: "2.8mm", fontWeight: 700, color: "white", backgroundColor: accent, padding: "3mm 4mm", textTransform: "uppercase", letterSpacing: "0.3mm" }}>Qty.</th>
                <th style={{ width: "23%", textAlign: "right", fontSize: "2.8mm", fontWeight: 700, color: "white", backgroundColor: accent, padding: "3mm 4mm", textTransform: "uppercase", letterSpacing: "0.3mm" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {norm.map((item, i) => (
                <tr key={i} style={{ pageBreakInside: "avoid" }}>
                  <td style={{ padding: "3.5mm 4mm", borderBottom: "0.3mm solid #e0e0d8", verticalAlign: "top" }}>
                    <p style={{ margin: 0, fontSize: "3.1mm", fontWeight: 500 }}>{safeText(item.description, 70)}</p>
                    {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#888" }}>{safeText(item.details, 80)}</p>}
                  </td>
                  <td style={{ ...R, padding: "3.5mm 4mm", borderBottom: "0.3mm solid #e0e0d8", fontSize: "3mm", color: "#555", verticalAlign: "top" }}>{fmt(Number(item.rate || 0))}</td>
                  <td style={{ ...R, padding: "3.5mm 4mm", borderBottom: "0.3mm solid #e0e0d8", fontSize: "3mm", color: "#555", verticalAlign: "top" }}>{Number(item.quantity || 0)}</td>
                  <td style={{ ...R, padding: "3.5mm 4mm", borderBottom: "0.3mm solid #e0e0d8", fontSize: "3mm", fontWeight: 600, verticalAlign: "top" }}>{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Thank you + Totals */}
          <table style={{ ...T, marginBottom: "6mm" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "top", paddingTop: "2mm" }}>
                  <p style={{ margin: 0, fontSize: "3mm", fontWeight: 600, color: accent }}>Thank you for your business</p>
                </td>
                <td style={{ width: "50%", verticalAlign: "top" }}>
                  <table style={T}>
                    <tbody>
                      {taxRate > 0 && (
                        <>
                          <tr>
                            <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Sub total</td>
                            <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(subtotal)}</td>
                          </tr>
                          <tr>
                            <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Tax ({taxRate}%)</td>
                            <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(taxAmount)}</td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td colSpan={2} style={{ padding: "1mm 0 0" }}>
                          <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "2.5mm 4mm", marginTop: "1mm" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <tbody><tr>
                                <td style={{ fontSize: "3.4mm", fontWeight: 700, color: "white", textAlign: "left" }}>Total</td>
                                <td style={{ fontSize: "3.4mm", fontWeight: 700, color: "white", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</td>
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

          {/* Payment Info */}
          <div style={{ marginBottom: "5mm" }}>
            <p style={{ margin: 0, fontSize: "3.4mm", fontWeight: 700, color: accent }}>Payment Info:</p>
            <table style={{ ...T, marginTop: "2mm" }}>
              <tbody>
                {profile?.company_phone && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Phone Number</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.company_phone, 40)}</td>
                  </tr>
                )}
                {profile?.company_website && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Website</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.company_website, 60)}</td>
                  </tr>
                )}
                {profile?.company_email && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Email Address</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.company_email, 60)}</td>
                  </tr>
                )}
                {profile?.company_address && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Address</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.company_address, 100)}</td>
                  </tr>
                )}
                {profile?.bank_name && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Bank</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.bank_name, 40)}</td>
                  </tr>
                )}
                {profile?.bank_account_number && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Account #</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.bank_account_number, 30)}</td>
                  </tr>
                )}
                {profile?.bank_branch_code && (
                  <tr>
                    <td style={{ width: "25%", fontSize: "2.8mm", color: "#888", padding: "0.8mm 0" }}>Branch Code</td>
                    <td style={{ fontSize: "2.8mm", color: "#555", padding: "0.8mm 0" }}>: {safeText(profile.bank_branch_code, 30)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer: Terms + Authorized Sign */}
        <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "16mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "55%", verticalAlign: "bottom" }}>
                  <p style={{ margin: 0, fontSize: "3.2mm", fontWeight: 700, color: accent }}>Terms and Conditions</p>
                  {notes && (
                     <p style={{ margin: "1.5mm 0 0", fontSize: "2.6mm", color: "#888", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                       {safeText(notes, 3000)}
                    </p>
                  )}
                </td>
                <td style={{ width: "45%", verticalAlign: "bottom", textAlign: "right" }}>
                  <div style={{ borderTop: `0.4mm solid ${accent}`, width: "35mm", marginLeft: "auto", paddingTop: "1.5mm" }}>
                    <p style={{ margin: 0, fontSize: "2.8mm", color: "#888" }}>Authorized Sign</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

InvoiceTemplate7.displayName = "InvoiceTemplate7";
export default InvoiceTemplate7;
