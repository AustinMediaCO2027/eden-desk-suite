import type { jsPDF } from "jspdf";
import { A4_WIDTH_MM, A4_HEIGHT_MM } from "@/components/templates/a4";

/**
 * Free-tier PDF watermark: "Created with eden-desk.com free online invoicing".
 * Drawn as vector text on top of the rasterised document so the link stays clickable.
 * Purely additive — it never touches the document layout itself.
 */

export const WATERMARK_PREFIX = "Created with ";
export const WATERMARK_LINK_TEXT = "eden-desk.com";
export const WATERMARK_SUFFIX = " free online invoicing";
export const WATERMARK_URL =
  "https://eden-desk.com/?utm_source=pdf_watermark&utm_medium=free_tier&utm_campaign=invoice_footer";

const RIGHT_MARGIN_MM = 10;
const BOTTOM_MARGIN_MM = 6;
const FONT_SIZE_PT = 7.5; // ~10px

export const drawPdfWatermark = (pdf: jsPDF, pageHeightMM = A4_HEIGHT_MM) => {
  try {
    const pages = pdf.getNumberOfPages();
    const lastPage = pages || 1;
    pdf.setPage(lastPage);

    const prevSize = pdf.getFontSize();

    pdf.setFontSize(FONT_SIZE_PT);
    pdf.setFont("helvetica", "normal");
    const prefixW = pdf.getTextWidth(WATERMARK_PREFIX);
    const suffixW = pdf.getTextWidth(WATERMARK_SUFFIX);
    pdf.setFont("helvetica", "bold");
    const linkW = pdf.getTextWidth(WATERMARK_LINK_TEXT);

    const totalW = prefixW + linkW + suffixW;
    const startX = A4_WIDTH_MM - RIGHT_MARGIN_MM - totalW;
    const y = pageHeightMM - BOTTOM_MARGIN_MM;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(85, 85, 85);
    pdf.text(WATERMARK_PREFIX, startX, y);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.textWithLink(WATERMARK_LINK_TEXT, startX + prefixW, y, { url: WATERMARK_URL });
    // Underline the link
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.line(startX + prefixW, y + 0.6, startX + prefixW + linkW, y + 0.6);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(85, 85, 85);
    pdf.text(WATERMARK_SUFFIX, startX + prefixW + linkW, y);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(prevSize);
  } catch (error) {
    console.error("Watermark render skipped:", error);
  }
};
