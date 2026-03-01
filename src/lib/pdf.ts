import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";
import { sanitizeDocumentFilename, toBase64FromArrayBuffer } from "@/lib/document-export-utils";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";
import LetterheadPrint from "@/components/print/LetterheadPrint";

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
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

const getOpts = (filename: string): any => ({
  margin: [0, 0, 0, 0],
  filename,
  image: { type: "png", quality: 1 },
  html2canvas: {
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
    removeContainer: false,
  },
  jsPDF: {
    unit: "mm",
    format: [A4_WIDTH_MM, A4_HEIGHT_MM],
    orientation: "portrait" as const,
    compress: true,
  },
  pagebreak: {
    mode: [] as string[],
  },
});

const waitForNextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

  element.style.width = A4_WIDTH;
  element.style.minWidth = A4_WIDTH;
  element.style.maxWidth = A4_WIDTH;
  element.style.height = A4_HEIGHT;
  element.style.minHeight = A4_HEIGHT;
  element.style.maxHeight = A4_HEIGHT;
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

const trimToSinglePage = (pdf: any) => {
  const totalPages = Number(pdf?.internal?.getNumberOfPages?.() || 1);
  for (let page = totalPages; page > 1; page -= 1) {
    pdf.deletePage(page);
  }
};

const createPrintHost = () => {
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-9999";
  host.style.width = A4_WIDTH;
  host.style.height = A4_HEIGHT;
  host.style.overflow = "hidden";
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
  await waitMs(100);

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

const buildSinglePagePdf = async (payload: DocumentPDFPayload, filename: string) => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return null;

  try {
    const worker: any = (html2pdf() as any)
      .set(getOpts(filename))
      .from(rendered.element)
      .toPdf();
    const pdf = await worker.get("pdf");
    trimToSinglePage(pdf);
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

