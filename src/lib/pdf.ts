import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import html2pdf from "html2pdf.js";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import type { LetterheadTemplateProps } from "@/components/letterhead/LetterheadTypes";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";
import LetterheadPrint from "@/components/print/LetterheadPrint";

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";

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
}

export type DocumentPDFPayload = InvoicePDFPayload | QuotePDFPayload | LetterheadPDFPayload;

const getOpts = (filename: string): any => ({
  margin: 0,
  filename,
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    scrollY: 0,
    windowWidth: 794,
    logging: false,
    removeContainer: true,
  },
  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "portrait" as const,
    compress: true,
  },
  pagebreak: {
    mode: [] as string[],
  },
});

const waitForNextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

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

const createPrintHost = () => {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-99999px";
  host.style.top = "0";
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
  await waitForNextFrame();
  await waitForImages(host);

  const element = host.firstElementChild as HTMLElement | null;

  if (!element) {
    root.unmount();
    host.remove();
    return null;
  }

  return {
    element,
    cleanup: () => {
      root.unmount();
      host.remove();
    },
  };
};

export const downloadDocumentPDF = async (payload: DocumentPDFPayload, filename: string) => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return;

  try {
    await html2pdf().set(getOpts(`${filename}.pdf`)).from(rendered.element).save();
  } finally {
    rendered.cleanup();
  }
};

export const generateDocumentPDFBase64 = async (payload: DocumentPDFPayload): Promise<string | null> => {
  const rendered = await renderPrintElement(payload);
  if (!rendered) return null;

  try {
    const dataUri = await html2pdf().set(getOpts("document.pdf")).from(rendered.element).outputPdf("datauristring");
    return dataUri.split(",")[1] || null;
  } catch {
    return null;
  } finally {
    rendered.cleanup();
  }
};
