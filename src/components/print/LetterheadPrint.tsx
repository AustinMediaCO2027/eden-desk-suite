import type { CSSProperties } from "react";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";

const PAGE_STYLE: CSSProperties = {
  width: "210mm",
  height: "297mm",
  padding: "20mm",
  boxSizing: "border-box",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "white",
  fontFamily: "Inter, Arial, sans-serif",
  color: "hsl(222 47% 11%)",
  pageBreakBefore: "avoid",
  pageBreakAfter: "avoid",
  pageBreakInside: "avoid",
};

const TABLE_RESET: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const safeText = (value: string | null | undefined, max: number) => (value || "").trim().slice(0, max);

const LetterheadPrint = ({
  profile,
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
}: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "hsl(206 66% 30%)";
  const bodyText = safeText(body, 3600);

  return (
    <div style={PAGE_STYLE} data-print-template="letterhead">
      <div style={{ height: "100%", position: "relative", paddingBottom: "30mm", boxSizing: "border-box" }}>
        <table style={{ ...TABLE_RESET, marginBottom: "4mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "56%", verticalAlign: "top" }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Company logo" style={{ maxHeight: "13mm", maxWidth: "100%", objectFit: "contain", marginBottom: "2mm" }} />
                ) : null}
                <p style={{ margin: 0, fontSize: "5.2mm", fontWeight: 700 }}>{safeText(profile?.company_name, 90) || "Your Company"}</p>
                {profile?.company_address ? (
                  <p style={{ margin: "1.2mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 150)}</p>
                ) : null}
              </td>
              <td style={{ width: "44%", verticalAlign: "top", textAlign: "right" }}>
                {profile?.company_phone ? <p style={{ margin: 0, fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(profile.company_phone, 40)}</p> : null}
                {profile?.company_email ? <p style={{ margin: "1mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(profile.company_email, 60)}</p> : null}
                {profile?.company_website ? <p style={{ margin: "1mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(profile.company_website, 60)}</p> : null}
                {profile?.registration_number ? <p style={{ margin: "1mm 0 0", fontSize: "2.8mm", color: "hsl(215 16% 47%)" }}>Reg: {safeText(profile.registration_number, 40)}</p> : null}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: "0.4mm", width: "100%", backgroundColor: brandColor, marginBottom: "5mm" }} />

        <table style={{ ...TABLE_RESET, marginBottom: "5mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "65%", verticalAlign: "top" }}>
                {recipientName ? <p style={{ margin: 0, fontSize: "3.2mm", fontWeight: 600 }}>{safeText(recipientName, 80)}</p> : null}
                {recipientTitle ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientTitle, 80)}</p> : null}
                {recipientCompany ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientCompany, 80)}</p> : null}
                {recipientAddress ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)", whiteSpace: "pre-wrap" }}>{safeText(recipientAddress, 160)}</p> : null}
                {recipientPhone ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientPhone, 50)}</p> : null}
                {recipientEmail ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientEmail, 70)}</p> : null}
              </td>
              <td style={{ width: "35%", verticalAlign: "top", textAlign: "right" }}>
                {date ? <p style={{ margin: 0, fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(date, 40)}</p> : null}
              </td>
            </tr>
          </tbody>
        </table>

        {subject ? (
          <table style={{ ...TABLE_RESET, marginBottom: "4mm" }}>
            <tbody>
              <tr>
                <td style={{ fontSize: "3.3mm", fontWeight: 700, color: "hsl(215 25% 25%)", paddingBottom: "1.2mm" }}>{safeText(subject, 160)}</td>
              </tr>
            </tbody>
          </table>
        ) : null}

        <table style={{ ...TABLE_RESET, marginBottom: "4mm" }}>
          <tbody>
            <tr>
              <td style={{ fontSize: "3.2mm", lineHeight: 1.65, color: "hsl(215 25% 25%)", verticalAlign: "top", whiteSpace: "pre-wrap", height: "138mm", overflow: "hidden" }}>
                {bodyText}
              </td>
            </tr>
          </tbody>
        </table>

        <table style={TABLE_RESET}>
          <tbody>
            <tr>
              <td style={{ fontSize: "3.2mm", color: "hsl(215 25% 25%)", verticalAlign: "top" }}>
                <p style={{ margin: 0 }}>{safeText(closing, 80) || "Sincerely,"}</p>
                {signatureUrl ? <img src={signatureUrl} alt="Signature" style={{ maxHeight: "12mm", maxWidth: "48mm", objectFit: "contain", marginTop: "2mm", marginBottom: "2mm" }} /> : null}
                <p style={{ margin: "1mm 0 0", fontWeight: 600 }}>{safeText(senderName, 80) || safeText(profile?.company_name, 80)}</p>
                {senderTitle ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(senderTitle, 80)}</p> : null}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "20mm", borderTop: "0.3mm solid hsl(220 13% 87%)", paddingTop: "3mm" }}>
        <table style={TABLE_RESET}>
          <tbody>
            <tr>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)" }}>{safeText(profile?.company_website, 60)}</td>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "center" }}>{safeText(profile?.company_phone, 40)}</td>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "right" }}>{safeText(profile?.company_email, 60)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LetterheadPrint;
