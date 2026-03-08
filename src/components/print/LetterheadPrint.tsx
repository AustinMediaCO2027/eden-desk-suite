import { forwardRef, type CSSProperties } from "react";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";

interface LetterheadPrintProps extends LetterheadTemplateProps {
  templateStyle?: string;
}

const DEFAULT_ACCENT = "hsl(358 78% 52%)";
const PAGE_BACKGROUND = "hsl(0 0% 93%)";
const TEXT_PRIMARY = "hsl(222 47% 11%)";
const TEXT_MUTED = "hsl(215 12% 42%)";
const WHITE = "hsl(0 0% 100%)";

const MAX_LINE_CHARS = 82;
const SINGLE_PAGE_LINES_WITH_SUBJECT = 14;
const SINGLE_PAGE_LINES_NO_SUBJECT = 16;
const FIRST_PAGE_LINES_WITH_SUBJECT = 20;
const FIRST_PAGE_LINES_NO_SUBJECT = 22;
const MIDDLE_PAGE_LINES = 36;
const LAST_PAGE_LINES = 24;

const safeText = (value: string | null | undefined, max: number) => (value || "").trim().slice(0, max);

const wrapParagraphToLines = (paragraph: string, maxChars: number) => {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [] as string[];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = "";
      }

      for (let start = 0; start < word.length; start += maxChars) {
        lines.push(word.slice(start, start + maxChars));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
};

const bodyToLines = (body: string) => {
  const text = safeText(body.replace(/\r/g, ""), 16000);
  if (!text) return [] as string[];

  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const lines: string[] = [];

  paragraphs.forEach((paragraph, index) => {
    lines.push(...wrapParagraphToLines(paragraph, MAX_LINE_CHARS));
    if (index < paragraphs.length - 1) lines.push("");
  });

  return lines;
};

const paginateBodyLines = (lines: string[], hasSubject: boolean) => {
  if (lines.length === 0) return [[]] as string[][];

  const singlePageLimit = hasSubject ? SINGLE_PAGE_LINES_WITH_SUBJECT : SINGLE_PAGE_LINES_NO_SUBJECT;
  if (lines.length <= singlePageLimit) {
    return [lines];
  }

  const firstPageLimit = hasSubject ? FIRST_PAGE_LINES_WITH_SUBJECT : FIRST_PAGE_LINES_NO_SUBJECT;
  const pages: string[][] = [lines.slice(0, firstPageLimit)];
  let cursor = firstPageLimit;

  while (lines.length - cursor > LAST_PAGE_LINES) {
    pages.push(lines.slice(cursor, cursor + MIDDLE_PAGE_LINES));
    cursor += MIDDLE_PAGE_LINES;
  }

  pages.push(lines.slice(cursor));
  return pages;
};

const getInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "ED";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

const pageStyle: CSSProperties = {
  width: "210mm",
  minWidth: "210mm",
  maxWidth: "210mm",
  height: "297mm",
  minHeight: "297mm",
  maxHeight: "297mm",
  position: "relative",
  boxSizing: "border-box",
  overflow: "hidden",
  backgroundColor: PAGE_BACKGROUND,
  color: TEXT_PRIMARY,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};

const renderCornerStripes = (accent: string) => (
  <>
    <div style={{ position: "absolute", top: "-42mm", left: "-54mm", width: "150mm", height: "10mm", transform: "rotate(-42deg)", backgroundColor: accent, zIndex: 0 }} />
    <div style={{ position: "absolute", top: "-35mm", left: "-47mm", width: "150mm", height: "7mm", transform: "rotate(-42deg)", backgroundColor: WHITE, zIndex: 0 }} />
    <div style={{ position: "absolute", top: "-28mm", left: "-40mm", width: "150mm", height: "10mm", transform: "rotate(-42deg)", backgroundColor: accent, zIndex: 0 }} />

    <div style={{ position: "absolute", bottom: "-42mm", right: "-54mm", width: "150mm", height: "10mm", transform: "rotate(-42deg)", backgroundColor: accent, zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: "-35mm", right: "-47mm", width: "150mm", height: "7mm", transform: "rotate(-42deg)", backgroundColor: WHITE, zIndex: 0 }} />
    <div style={{ position: "absolute", bottom: "-28mm", right: "-40mm", width: "150mm", height: "10mm", transform: "rotate(-42deg)", backgroundColor: accent, zIndex: 0 }} />
  </>
);

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
    const accent = colorOverride || profile?.brand_color || DEFAULT_ACCENT;
    const companyName = safeText(profile?.company_name, 90) || "Your Company";
    const hasSubject = Boolean(safeText(subject, 160));

    const bodyLines = bodyToLines(body);
    const pagedBody = paginateBodyLines(bodyLines, hasSubject);

    const salutationTarget = safeText(recipientName, 80) || "Sir/Madam";
    const displayClosing = safeText(closing, 70) || "Thanks and best wishes,";
    const displaySender = safeText(senderName, 80) || companyName;

    return (
      <div ref={ref} data-print-template="letterhead" data-template-style={templateStyle}>
        {pagedBody.map((pageLines, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === pagedBody.length - 1;
          const initials = getInitials(companyName);

          return (
            <div key={`letterhead-page-${pageIndex}`} style={pageStyle} data-pdf-section="page">
              {renderCornerStripes(accent)}

              {isFirstPage ? (
                <>
                  <div style={{ position: "absolute", top: "36mm", left: "20mm", right: "18mm", display: "flex", justifyContent: "space-between", gap: "10mm", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6mm", maxWidth: "105mm" }}>
                      {profile?.logo_url ? (
                        <img src={profile.logo_url} alt="Company logo" style={{ width: "16mm", height: "16mm", objectFit: "contain" }} />
                      ) : (
                        <div
                          style={{
                            width: "16mm",
                            height: "16mm",
                            borderRadius: "3mm",
                            backgroundColor: accent,
                            color: WHITE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "4.2mm",
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <p style={{ margin: 0, fontSize: "9mm", lineHeight: 1.05, fontWeight: 700, color: TEXT_PRIMARY }}>{companyName}</p>
                    </div>

                    <div style={{ display: "flex", gap: "4mm", minWidth: "66mm", maxWidth: "66mm" }}>
                      <div style={{ width: "0.6mm", backgroundColor: TEXT_PRIMARY, opacity: 0.9 }} />
                      <div style={{ fontSize: "3.6mm", lineHeight: 1.5, color: TEXT_MUTED }}>
                        {profile?.company_phone ? <p style={{ margin: "0 0 1mm 0" }}>☎ {safeText(profile.company_phone, 40)}</p> : null}
                        {profile?.company_email ? <p style={{ margin: "0 0 1mm 0" }}>✉ {safeText(profile.company_email, 60)}</p> : null}
                        {profile?.company_address ? <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>📍 {safeText(profile.company_address, 130)}</p> : null}
                      </div>
                    </div>
                  </div>

                  <div style={{ position: "absolute", top: "87mm", left: "20mm", right: "18mm", display: "flex", justifyContent: "space-between", gap: "8mm", zIndex: 1 }}>
                    <div style={{ maxWidth: "120mm" }}>
                      <p style={{ margin: "0 0 4mm 0", fontSize: "4.6mm", fontWeight: 600, color: TEXT_PRIMARY }}>To :</p>
                      {recipientName ? <p style={{ margin: 0, fontSize: "4.8mm", lineHeight: 1.35, color: TEXT_PRIMARY }}>{safeText(recipientName, 80)}</p> : null}
                      {recipientTitle ? <p style={{ margin: "0.8mm 0 0", fontSize: "4.2mm", color: TEXT_MUTED }}>{safeText(recipientTitle, 80)}</p> : null}
                      {recipientCompany ? <p style={{ margin: "0.8mm 0 0", fontSize: "4.2mm", color: TEXT_MUTED }}>{safeText(recipientCompany, 80)}</p> : null}
                      {recipientAddress ? (
                        <p style={{ margin: "0.8mm 0 0", fontSize: "4.2mm", color: TEXT_MUTED, whiteSpace: "pre-wrap" }}>{safeText(recipientAddress, 150)}</p>
                      ) : null}
                      {recipientPhone ? <p style={{ margin: "0.8mm 0 0", fontSize: "4.2mm", color: TEXT_MUTED }}>{safeText(recipientPhone, 60)}</p> : null}
                      {recipientEmail ? <p style={{ margin: "0.8mm 0 0", fontSize: "4.2mm", color: TEXT_MUTED }}>{safeText(recipientEmail, 80)}</p> : null}
                    </div>

                    <p style={{ margin: "31mm 0 0", fontSize: "5.2mm", color: TEXT_PRIMARY, whiteSpace: "nowrap" }}>{safeText(date, 40)}</p>
                  </div>

                  {hasSubject ? (
                    <p style={{ position: "absolute", top: "111mm", left: "20mm", right: "18mm", margin: 0, fontSize: "4.8mm", fontWeight: 700, color: TEXT_PRIMARY, zIndex: 1 }}>
                      {safeText(subject, 160)}
                    </p>
                  ) : null}

                  <p
                    style={{
                      position: "absolute",
                      top: hasSubject ? "121mm" : "114mm",
                      left: "20mm",
                      right: "18mm",
                      margin: 0,
                      fontSize: "5.2mm",
                      color: TEXT_PRIMARY,
                      zIndex: 1,
                    }}
                  >
                    Dear {salutationTarget},
                  </p>
                </>
              ) : (
                <div style={{ position: "absolute", top: "25mm", left: "20mm", right: "18mm", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
                  <p style={{ margin: 0, fontSize: "5.2mm", fontWeight: 700, color: TEXT_PRIMARY }}>{companyName}</p>
                  <p style={{ margin: 0, fontSize: "3.8mm", color: TEXT_MUTED }}>Page {pageIndex + 1}</p>
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  left: "20mm",
                  right: "18mm",
                  top: isFirstPage ? "130mm" : "36mm",
                  bottom: isLastPage ? "96mm" : "28mm",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                {pageLines.map((line, lineIndex) => (
                  <p
                    key={`line-${pageIndex}-${lineIndex}`}
                    style={{
                      margin: line ? "0 0 1.4mm 0" : "0 0 3mm 0",
                      fontSize: "4.7mm",
                      lineHeight: 1.5,
                      color: TEXT_MUTED,
                    }}
                  >
                    {line || "\u00A0"}
                  </p>
                ))}
              </div>

              {isLastPage ? (
                <div style={{ position: "absolute", left: "20mm", right: "18mm", bottom: "26mm", zIndex: 1 }}>
                  <p style={{ margin: 0, fontSize: "5.2mm", color: TEXT_PRIMARY }}>{displayClosing}</p>

                  <div style={{ marginTop: "16mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "8mm" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "5.6mm", fontWeight: 600, color: TEXT_PRIMARY }}>{displaySender}</p>
                      {senderTitle ? <p style={{ margin: "1.2mm 0 0", fontSize: "4.4mm", color: TEXT_MUTED }}>{safeText(senderTitle, 80)}</p> : null}
                    </div>

                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Signature" style={{ maxWidth: "52mm", maxHeight: "18mm", objectFit: "contain" }} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "10mm", fontFamily: "'Brush Script MT', cursive", color: TEXT_PRIMARY }}>{displaySender}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }
);

LetterheadPrint.displayName = "LetterheadPrint";

export default LetterheadPrint;
