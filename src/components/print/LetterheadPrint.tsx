import { forwardRef } from "react";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";

interface LetterheadPrintProps extends LetterheadTemplateProps {
  templateStyle?: string;
}

const LetterheadPrint = forwardRef<HTMLDivElement, LetterheadPrintProps>(
  (
    {
      profile,
      templateStyle = "classic",
      recipientName,
      recipientTitle,
      recipientCompany,
      recipientAddress,
      recipientPhone,
      recipientEmail,
      date,
      subject,
      body,
      closing,
      senderName,
      senderTitle,
      colorOverride,
      signatureUrl,
    },
    ref
  ) => {
    const accent = colorOverride || profile?.brand_color || "#1A5276";
    const companyName = profile?.company_name || "Your Company";

    const pageStyle: React.CSSProperties = {
      width: "210mm",
      minWidth: "210mm",
      maxWidth: "210mm",
      height: "297mm",
      minHeight: "297mm",
      maxHeight: "297mm",
      overflow: "hidden",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      color: "#1a1a1a",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      position: "relative",
    };

    return (
      <div ref={ref} style={pageStyle}>
        {/* ─── HEADER ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td style={{ padding: "10mm 12mm 0 12mm", verticalAlign: "top" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: "middle", width: "60%" }}>
                        <table style={{ borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              {profile?.logo_url && (
                                <td style={{ verticalAlign: "middle", paddingRight: "4mm" }}>
                                  <img
                                    src={profile.logo_url}
                                    alt="Logo"
                                    style={{ height: "14mm", maxWidth: "30mm", objectFit: "contain", display: "block" }}
                                  />
                                </td>
                              )}
                              <td style={{ verticalAlign: "middle" }}>
                                <p style={{ margin: 0, fontSize: "6mm", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                                  {companyName}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style={{ verticalAlign: "top", textAlign: "right", width: "40%", fontSize: "3mm", lineHeight: 1.7, color: "#6b7280" }}>
                        {profile?.company_address && <p style={{ margin: 0 }}>{profile.company_address}</p>}
                        {profile?.company_phone && <p style={{ margin: 0 }}>{profile.company_phone}</p>}
                        {profile?.company_email && <p style={{ margin: 0 }}>{profile.company_email}</p>}
                        {profile?.company_website && <p style={{ margin: 0 }}>{profile.company_website}</p>}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Accent line */}
                <div style={{ height: "0.8mm", width: "100%", backgroundColor: accent, marginTop: "4mm" }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── DATE + RECIPIENT ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6mm 12mm 0 12mm" }}>
                {date && <p style={{ margin: "0 0 4mm 0", fontSize: "3.4mm", color: "#6b7280" }}>{date}</p>}

                {recipientName && (
                  <div style={{ marginBottom: "4mm" }}>
                    <p style={{ margin: 0, fontSize: "3.8mm", fontWeight: 600, color: "#111827" }}>{recipientName}</p>
                    {recipientTitle && <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280" }}>{recipientTitle}</p>}
                    {recipientCompany && <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280" }}>{recipientCompany}</p>}
                    {recipientAddress && <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280", whiteSpace: "pre-wrap" }}>{recipientAddress}</p>}
                    {recipientPhone && <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280" }}>{recipientPhone}</p>}
                    {recipientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280" }}>{recipientEmail}</p>}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── SUBJECT ─── */}
        {subject && (
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2mm 12mm 0 12mm" }}>
                  <p style={{ margin: 0, fontSize: "4mm", fontWeight: 700, color: "#111827" }}>{subject}</p>
                  <div style={{ height: "0.6mm", width: "12mm", backgroundColor: accent, marginTop: "2mm", borderRadius: "1mm" }} />
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ─── SALUTATION ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4mm 12mm 0 12mm" }}>
                <p style={{ margin: 0, fontSize: "3.6mm", color: "#374151" }}>
                  Dear {recipientName || "Sir/Madam"},
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── BODY ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td style={{ padding: "3mm 12mm 0 12mm" }}>
                <div
                  style={{
                    fontSize: "3.4mm",
                    lineHeight: 1.65,
                    color: "#374151",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    textAlign: "justify",
                  }}
                >
                  {body}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── CLOSING + SIGNATURE ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6mm 12mm 0 12mm" }}>
                <p style={{ margin: "0 0 2mm 0", fontSize: "3.6mm", color: "#374151" }}>{closing || "Sincerely,"}</p>

                {signatureUrl && (
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    style={{ height: "14mm", maxWidth: "50mm", objectFit: "contain", display: "block", margin: "2mm 0" }}
                  />
                )}

                <p style={{ margin: "2mm 0 0", fontSize: "3.8mm", fontWeight: 600, color: "#111827" }}>
                  {senderName || companyName}
                </p>
                {senderTitle && (
                  <p style={{ margin: "0.5mm 0 0", fontSize: "3.2mm", color: "#6b7280" }}>{senderTitle}</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── FOOTER ─── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 12mm 8mm 12mm",
          }}
        >
          <div style={{ height: "0.3mm", width: "100%", backgroundColor: "#e5e7eb", marginBottom: "3mm" }} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "2.6mm", color: "#9ca3af" }}>
            <tbody>
              <tr>
                {profile?.company_website && (
                  <td style={{ textAlign: "left" }}>
                    <span style={{ fontWeight: 700, color: accent }}>W.</span> {profile.company_website}
                  </td>
                )}
                {profile?.company_email && (
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: accent }}>E.</span> {profile.company_email}
                  </td>
                )}
                {profile?.company_phone && (
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: 700, color: accent }}>T.</span> {profile.company_phone}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
          {(profile?.registration_number || profile?.vat_number) && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "2.4mm", color: "#9ca3af", marginTop: "1.5mm" }}>
              <tbody>
                <tr>
                  {profile?.registration_number && <td style={{ textAlign: "left" }}>Reg: {profile.registration_number}</td>}
                  {profile?.vat_number && <td style={{ textAlign: "right" }}>VAT: {profile.vat_number}</td>}
                </tr>
              </tbody>
            </table>
          )}
          <div style={{ height: "0.8mm", width: "100%", backgroundColor: accent, marginTop: "3mm" }} />
        </div>
      </div>
    );
  }
);

LetterheadPrint.displayName = "LetterheadPrint";

export default LetterheadPrint;
