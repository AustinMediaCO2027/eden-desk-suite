import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";
import { sanitizeDocumentFilename, toBase64FromArrayBuffer } from "@/lib/document-export-utils";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";
import LetterheadPrint from "@/components/print/LetterheadPrint";

import { A4_WIDTH_MM, A4_HEIGHT_MM, A4_WIDTH_PX, A4_HEIGHT_PX } from "@/components/templates/a4";
import { drawPdfWatermark } from "@/lib/pdf-watermark";


interface BaseDocumentPayload {
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
  templateStyle?: string;
}

export interface InvoicePDFPayload extends BaseDocumentPayload {
  type: "invoice";
  dueDate?: string;
}

export interface QuotePDFPayload extends BaseDocumentPayload {
  type: "quote";
}

export interface LetterheadPDFPayload extends LetterheadTemplateProps {
  type: "letterhead";
  templateStyle?: string;
}

export type DocumentPDFPayload = (InvoicePDFPayload | QuotePDFPayload | LetterheadPDFPayload) & {
  /** Free-tier clickable footer watermark. */
  watermark?: boolean;
};

const waitForNextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const waitForFonts = async () => {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts?.ready) return;
  try {
    await Promise.race([fonts.ready, waitMs(600)]);
  } catch {
    // Ignore font readiness errors
  }
};

const waitForImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
};

const enforceA4Canvas = (element: HTMLElement) => {
  const original = {
    width: element.style.width,
    minWidth: element.style.minWidth,
    maxWidth: element.style.maxWidth,
    height: element.style.height,
    minHeight: element.style.minHeight,
    maxHeight: element.style.maxHeight,
    overflow: element.style.overflow,
    margin: element.style.margin,
    transform: element.style.transform,
    position: element.style.position,
    boxSizing: element.style.boxSizing,
  };

  element.style.width = `${A4_WIDTH_PX}px`;
  element.style.minWidth = `${A4_WIDTH_PX}px`;
  element.style.maxWidth = `${A4_WIDTH_PX}px`;
  element.style.height = `${A4_HEIGHT_PX}px`;
  element.style.minHeight = `${A4_HEIGHT_PX}px`;
  element.style.maxHeight = `${A4_HEIGHT_PX}px`;
  element.style.overflow = "hidden";
  element.style.margin = "0";
  element.style.transform = "none";
  element.style.position = "relative";
  element.style.boxSizing = "border-box";

  return () => {
    element.style.width = original.width;
    element.style.minWidth = original.minWidth;
    element.style.maxWidth = original.maxWidth;
    element.style.height = original.height;
    element.style.minHeight = original.minHeight;
    element.style.maxHeight = original.maxHeight;
    element.style.overflow = original.overflow;
    element.style.margin = original.margin;
    element.style.transform = original.transform;
    element.style.position = original.position;
    element.style.boxSizing = original.boxSizing;
  };
};

const createPrintHost = (allowOverflow = false) => {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.width = `${A4_WIDTH_PX}px`;
  if (!allowOverflow) {
    host.style.height = `${A4_HEIGHT_PX}px`;
    host.style.overflow = "hidden";
  } else {
    host.style.height = "auto";
    host.style.overflow = "visible";
  }
  host.style.pointerEvents = "none";
  host.style.opacity = "0";
  host.style.background = "white";
  host.setAttribute("data-print-host", "true");
  document.body.appendChild(host);
  return host;
};

const buildNode = (payload: DocumentPDFPayload) => {
  if (payload.type === "invoice") {
    return createElement(InvoicePrint, {
      profile: payload.profile,
      templateStyle: payload.templateStyle,
      documentNumber: payload.documentNumber,
      date: payload.date,
      dueDate: payload.dueDate,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      clientAddress: payload.clientAddress,
      items: payload.items,
      taxRate: payload.taxRate,
      notes: payload.notes,
      status: payload.status,
      colorOverride: payload.colorOverride,
    });
  }

  if (payload.type === "quote") {
    return createElement(QuotePrint, {
      profile: payload.profile,
      templateStyle: payload.templateStyle,
      documentNumber: payload.documentNumber,
      date: payload.date,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      clientAddress: payload.clientAddress,
      items: payload.items,
      taxRate: payload.taxRate,
      notes: payload.notes,
      status: payload.status,
      colorOverride: payload.colorOverride,
    });
  }

  return createElement(LetterheadPrint, {
    profile: payload.profile,
    templateStyle: payload.templateStyle,
    recipientName: payload.recipientName,
    recipientTitle: payload.recipientTitle,
    recipientCompany: payload.recipientCompany,
    recipientAddress: payload.recipientAddress,
    recipientPhone: payload.recipientPhone,
    recipientEmail: payload.recipientEmail,
    date: payload.date,
    subject: payload.subject,
    body: payload.body,
    closing: payload.closing,
    senderName: payload.senderName,
    senderTitle: payload.senderTitle,
    colorOverride: payload.colorOverride,
    signatureUrl: payload.signatureUrl,
  });
};

const renderPrintElement = async (payload: DocumentPDFPayload) => {
  const host = createPrintHost(false);
  const root = createRoot(host);

  flushSync(() => {
    root.render(buildNode(payload));
  });

  await waitForNextFrame();
  await waitForImages(host);
  await waitForFonts();
  await waitMs(120);

  const element = host.firstElementChild as HTMLElement | null;

  if (!element) {
    root.unmount();
    host.remove();
    return null;
  }

  const restoreA4 = enforceA4Canvas(element);
  return {
    element,
    cleanup: () => {
      restoreA4();
      root.unmount();
      host.remove();
    },
  };
};

const MARGIN_MM = 0; // Margins are already in the template padding
const CONTENT_WIDTH_MM = A4_WIDTH_MM;
const SECTION_GAP_MM = 2;
const MIN_SLICE_HEIGHT_PX = 8;

const renderSectionCanvas = async (section: HTMLElement) => {
  const sectionHeight = Math.max(section.scrollHeight || 0, section.offsetHeight || 0, A4_HEIGHT_PX);

  return html2canvas(section, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: A4_WIDTH_PX,
    height: sectionHeight,
    windowWidth: A4_WIDTH_PX,
    windowHeight: sectionHeight,
    scrollX: 0,
    scrollY: 0,
  });
};

const appendFullPageSection = (pdf: jsPDF, canvas: HTMLCanvasElement) => {
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");
};

const appendCanvasToPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, startY: number) => {
  const pxPerMM = canvas.width / CONTENT_WIDTH_MM;
  if (!Number.isFinite(pxPerMM) || pxPerMM <= 0 || canvas.height <= 0) {
    return startY;
  }

  let currentY = startY;
  let offsetY = 0;

  while (offsetY < canvas.height) {
    const remainingMM = A4_HEIGHT_MM - currentY;

    if (remainingMM <= 0.1) {
      pdf.addPage();
      currentY = MARGIN_MM;
      continue;
    }

    let sliceHeightPx = Math.floor(remainingMM * pxPerMM);
    const remainingPx = canvas.height - offsetY;
    sliceHeightPx = Math.min(sliceHeightPx, remainingPx);

    if (sliceHeightPx < MIN_SLICE_HEIGHT_PX) {
      pdf.addPage();
      currentY = MARGIN_MM;
      continue;
    }

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;

    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) break;

    ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    const sliceHeightMM = sliceHeightPx / pxPerMM;
    const imgData = sliceCanvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", MARGIN_MM, currentY, CONTENT_WIDTH_MM, sliceHeightMM, undefined, "FAST");

    offsetY += sliceHeightPx;
    currentY += sliceHeightMM;

    if (offsetY < canvas.height) {
      pdf.addPage();
      currentY = MARGIN_MM;
    }
  }

  return currentY;
};

const buildSectionBasedPdf = async (payload: DocumentPDFPayload) => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return null;

  try {
    const sections = Array.from(
      rendered.element.querySelectorAll("[data-pdf-section]")
    ) as HTMLElement[];

    if (sections.length === 0) {
      // Fallback to single-page capture
      return buildSinglePagePdf(payload, "document.pdf");
    }

    const pdf = new jsPDF({
      unit: "mm",
      format: [A4_WIDTH_MM, A4_HEIGHT_MM],
      orientation: "portrait",
      compress: true,
    });

    const allSectionsArePages = sections.every((section) => section.dataset.pdfSection === "page");

    if (allSectionsArePages) {
      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        const canvas = await renderSectionCanvas(section);

        if (!canvas.width || !canvas.height) {
          continue;
        }

        if (index > 0) {
          pdf.addPage();
        }

        appendFullPageSection(pdf, canvas);
      }

      return pdf;
    }

    let currentY = MARGIN_MM;

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const canvas = await renderSectionCanvas(section);

      if (!canvas.width || !canvas.height) {
        continue;
      }

      const pxPerMM = canvas.width / CONTENT_WIDTH_MM;
      const sectionHeightMM = canvas.height / pxPerMM;
      const remainingSpaceMM = A4_HEIGHT_MM - currentY;

      // Keep normal-sized sections intact by moving them to a new page when needed
      if (sectionHeightMM <= A4_HEIGHT_MM - MARGIN_MM && sectionHeightMM > remainingSpaceMM && currentY > MARGIN_MM) {
        pdf.addPage();
        currentY = MARGIN_MM;
      }

      currentY = appendCanvasToPdf(pdf, canvas, currentY);

      const hasMoreSections = index < sections.length - 1;
      if (hasMoreSections) {
        currentY += SECTION_GAP_MM;
        if (currentY >= A4_HEIGHT_MM) {
          pdf.addPage();
          currentY = MARGIN_MM;
        }
      }
    }

    return pdf;
  } catch (err) {
    console.error("Section-based PDF generation error:", err);
    return null;
  } finally {
    rendered.cleanup();
  }
};

const buildSinglePagePdf = async (payload: DocumentPDFPayload, _filename: string) => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return null;

  try {
    const canvas = await html2canvas(rendered.element, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF({
      unit: "mm",
      format: [A4_WIDTH_MM, A4_HEIGHT_MM],
      orientation: "portrait",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");

    if (payload.watermark) {
      drawPdfWatermark(pdf);
    }

    return pdf;
  } catch (err) {
    console.error("PDF generation error:", err);
    return null;
  } finally {
    rendered.cleanup();
  }
};

const buildPdf = async (payload: DocumentPDFPayload, filename: string) => {
  return buildSinglePagePdf(payload, filename);
};

export const downloadDocumentPDF = async (payload: DocumentPDFPayload, filename: string) => {
  const safeFilename = sanitizeDocumentFilename(filename, "document");
  const pdf = await buildPdf(payload, `${safeFilename}.pdf`);
  if (!pdf) return;
  pdf.save(`${safeFilename}.pdf`);
};

export const generateDocumentPDFBase64 = async (payload: DocumentPDFPayload): Promise<string | null> => {
  try {
    const pdf = await buildPdf(payload, "document.pdf");
    if (!pdf) return null;
    const pdfArrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;
    return toBase64FromArrayBuffer(pdfArrayBuffer);
  } catch {
    return null;
  }
};
