import { forwardRef, type CSSProperties } from "react";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";

interface LetterheadPrintProps extends LetterheadTemplateProps {
  templateStyle?: string;
}

interface LetterheadPreset {
  accent: string;
  darkHeader: boolean;
  subjectPrefix: string;
  footerLabels: boolean;
}

const LETTERHEAD_PRESETS: Record<string, LetterheadPreset> = {
  classic: {
    accent: "hsl(206 66% 30%)",
    darkHeader: false,
    subjectPrefix: "",
    footerLabels: true,
  },
  corporate: {
    accent: "hsl(26 77% 45%)",
    darkHeader: false,
    subjectPrefix: "Re: ",
    footerLabels: false,
  },
  executive: {
    accent: "hsl(222 47% 11%)",
    darkHeader: true,
    subjectPrefix: "",
    footerLabels: true,
  },
};

const PAGE_STYLE: CSSProperties = {
  width: "210mm",
  minWidth: "210mm",
  padding: "20mm",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  color: "hsl(222 47% 11%)",
};

const TABLE_RESET: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const safeText = (value: string | null | undefined, max: number) => (value || "").trim().slice(0, max);

const MAX_BODY_SECTION_CHARS = 700;

const chunkParagraph = (paragraph: string, maxChars: number) => {
  const clean = paragraph.trim();
  if (!clean) return [] as string[];
  if (clean.length <= maxChars) return [clean];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + maxChars, clean.length);

    if (end < clean.length) {
      const lastLineBreak = clean.lastIndexOf("\n", end);
      const lastSpace = clean.lastIndexOf(" ", end);
      const breakPoint = Math.max(lastLineBreak, lastSpace);

      if (breakPoint > start + Math.floor(maxChars * 0.6)) {
        end = breakPoint;
      }
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    start = end;
    while (start < clean.length && /\s/.test(clean[start])) {
      start += 1;
    }
  }

  return chunks;
};

const splitBodyIntoSections = (bodyText: string) => {
  return bodyText
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) => chunkParagraph(paragraph, MAX_BODY_SECTION_CHARS));
};

const LetterheadPrint = forwardRef<HTMLDivElement, LetterheadPrintProps>(
  ({
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
  }, ref) => {
    const preset = LETTERHEAD_PRESETS[templateStyle] || LETTERHEAD_PRESETS.classic;
    const brandColor = colorOverride || profile?.brand_color || preset.accent;
    const bodyText = safeText(body, 8000);
    const bodySections = splitBodyIntoSections(bodyText);

    return (
      <div ref={ref} style={PAGE_STYLE} data-print-template="letterhead" data-template-style={templateStyle}>
        {/* HEADER SECTION */}
        <div data-pdf-section="header">
          <table style={{ ...TABLE_RESET, marginBottom: "4mm", backgroundColor: preset.darkHeader ? brandColor : "transparent" }}>
            <tbody>
              <tr>
                <td style={{ width: "56%", verticalAlign: "top", padding: preset.darkHeader ? "4mm" : "0" }}>
                  {profile?.logo_url ? (
                    <img src={profile.logo_url} alt="Company logo" style={{ maxHeight: "13mm", maxWidth: "100%", objectFit: "contain", marginBottom: "2mm", filter: preset.darkHeader ? "brightness(0) invert(1)" : "none" }} />
                  ) : null}
                  <p style={{ margin: 0, fontSize: "5.2mm", fontWeight: 700, color: preset.darkHeader ? "hsl(0 0% 100%)" : "hsl(222 47% 11%)" }}>{safeText(profile?.company_name, 90) || "Your Company"}</p>
                  {profile?.company_address ? (
                    <p style={{ margin: "1.2mm 0 0", fontSize: "3mm", color: preset.darkHeader ? "hsl(0 0% 92%)" : "hsl(215 16% 47%)", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 150)}</p>
                  ) : null}
                </td>
                <td style={{ width: "44%", verticalAlign: "top", textAlign: "right", padding: preset.darkHeader ? "4mm" : "0" }}>
                  {profile?.company_phone ? <p style={{ margin: 0, fontSize: "3mm", color: preset.darkHeader ? "hsl(0 0% 92%)" : "hsl(215 16% 47%)" }}>{safeText(profile.company_phone, 40)}</p> : null}
                  {profile?.company_email ? <p style={{ margin: "1mm 0 0", fontSize: "3mm", color: preset.darkHeader ? "hsl(0 0% 92%)" : "hsl(215 16% 47%)" }}>{safeText(profile.company_email, 60)}</p> : null}
                  {profile?.company_website ? <p style={{ margin: "1mm 0 0", fontSize: "3mm", color: preset.darkHeader ? "hsl(0 0% 92%)" : "hsl(215 16% 47%)" }}>{safeText(profile.company_website, 60)}</p> : null}
                  {profile?.registration_number ? <p style={{ margin: "1mm 0 0", fontSize: "2.8mm", color: preset.darkHeader ? "hsl(0 0% 92%)" : "hsl(215 16% 47%)" }}>Reg: {safeText(profile.registration_number, 40)}</p> : null}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ height: templateStyle === "corporate" ? "0.8mm" : "0.4mm", width: "100%", backgroundColor: brandColor, marginBottom: "5mm" }} />
        </div>

        {/* RECIPIENT SECTION */}
        <div data-pdf-section="recipient">
          <table style={{ ...TABLE_RESET, marginBottom: "5mm" }}>
            <tbody>
              <tr>
                <td style={{ width: "65%", verticalAlign: "top" }}>
                  {recipientName ? <p style={{ margin: 0, fontSize: "3.2mm", fontWeight: 600 }}>{safeText(recipientName, 80)}</p> : null}
                  {recipientTitle ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientTitle, 80)}</p> : null}
                  {recipientCompany ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientCompany, 80)}</p> : null}
                  {recipientAddress ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)", whiteSpace: "pre-wrap" }}>{safeText(recipientAddress, 130)}</p> : null}
                  {recipientPhone ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientPhone, 50)}</p> : null}
                  {recipientEmail ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(recipientEmail, 70)}</p> : null}
                </td>
                <td style={{ width: "35%", verticalAlign: "top", textAlign: "right" }}>
                  {date ? <p style={{ margin: 0, fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(date, 40)}</p> : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SUBJECT SECTION */}
        {subject ? (
          <div data-pdf-section="subject">
            <table style={{ ...TABLE_RESET, marginBottom: "4mm" }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: "3.3mm", fontWeight: 700, color: "hsl(215 25% 25%)", paddingBottom: "1.2mm" }}>{preset.subjectPrefix}{safeText(subject, 140)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {/* BODY PARAGRAPHS - each as its own section for pagination */}
        {bodySections.map((section, index) => (
          <div key={`body-${index}`} data-pdf-section="body">
            <p style={{ fontSize: "3.2mm", lineHeight: 1.65, color: "hsl(215 25% 25%)", whiteSpace: "pre-wrap", margin: index === 0 ? "0 0 3mm 0" : "3mm 0" }}>
              {section}
            </p>
          </div>
        ))}

        {/* CLOSING SECTION */}
        <div data-pdf-section="closing" style={{ marginTop: "5mm" }}>
          <p style={{ margin: 0, fontSize: "3.2mm", color: "hsl(215 25% 25%)" }}>{safeText(closing, 60) || "Sincerely,"}</p>
          {signatureUrl ? <img src={signatureUrl} alt="Signature" style={{ maxHeight: "12mm", maxWidth: "48mm", objectFit: "contain", marginTop: "2mm", marginBottom: "2mm" }} /> : null}
          <p style={{ margin: "1mm 0 0", fontWeight: 600, fontSize: "3.2mm" }}>{safeText(senderName, 80) || safeText(profile?.company_name, 80)}</p>
          {senderTitle ? <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", color: "hsl(215 16% 47%)" }}>{safeText(senderTitle, 80)}</p> : null}
        </div>

        {/* FOOTER SECTION */}
        <div data-pdf-section="footer" style={{ borderTop: "0.3mm solid hsl(220 13% 87%)", paddingTop: "3mm", marginTop: "8mm" }}>
          <table style={TABLE_RESET}>
            <tbody>
              <tr>
                <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {preset.footerLabels ? <span style={{ color: brandColor, fontWeight: 700 }}>W. </span> : null}
                  {safeText(profile?.company_website, 60)}
                </td>
                <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {preset.footerLabels ? <span style={{ color: brandColor, fontWeight: 700 }}>T. </span> : null}
                  {safeText(profile?.company_phone, 40)}
                </td>
                <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {preset.footerLabels ? <span style={{ color: brandColor, fontWeight: 700 }}>E. </span> : null}
                  {safeText(profile?.company_email, 60)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

LetterheadPrint.displayName = "LetterheadPrint";

export default LetterheadPrint;
