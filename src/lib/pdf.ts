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

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

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

export type DocumentPDFPayload = InvoicePDFPayload | QuotePDFPayload | LetterheadPDFPayload;

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
  const host = createPrintHost();
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

const buildSinglePagePdf = async (payload: DocumentPDFPayload, _filename: string) => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return null;

  try {
    // Capture element to canvas at 2x scale for crisp output
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

    // Create single-page A4 PDF and place the captured image
    const pdf = new jsPDF({
      unit: "mm",
      format: [A4_WIDTH_MM, A4_HEIGHT_MM],
      orientation: "portrait",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");

    return pdf;
  } catch (err) {
    console.error("PDF generation error:", err);
    return null;
  } finally {
    rendered.cleanup();
  }
};

export const downloadDocumentPDF = async (payload: DocumentPDFPayload, filename: string) => {
  const safeFilename = sanitizeDocumentFilename(filename, "document");
  const pdf = await buildSinglePagePdf(payload, `${safeFilename}.pdf`);
  if (!pdf) return;
  pdf.save(`${safeFilename}.pdf`);
};

export const generateDocumentPDFBase64 = async (payload: DocumentPDFPayload): Promise<string | null> => {
  try {
    const pdf = await buildSinglePagePdf(payload, "document.pdf");
    if (!pdf) return null;
    const pdfArrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;
    return toBase64FromArrayBuffer(pdfArrayBuffer);
  } catch {
    return null;
  }
};
