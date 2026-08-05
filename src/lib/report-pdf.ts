import { createElement, type ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { A4_WIDTH_MM, A4_HEIGHT_MM, A4_WIDTH_PX } from "@/components/templates/a4";
import { sanitizeDocumentFilename, toBase64FromArrayBuffer } from "@/lib/document-export-utils";

/**
 * Multi-page A4 PDF renderer for accounting documents (purchase orders,
 * client statements and reports). Kept fully separate from src/lib/pdf.ts so
 * existing invoice / quote / letterhead exports are untouched.
 */

const FOOTER_HEIGHT_MM = 10;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - FOOTER_HEIGHT_MM;

const waitFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const waitForAssets = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts?.ready) {
    try {
      await Promise.race([fonts.ready, waitMs(600)]);
    } catch {
      /* font readiness is best effort */
    }
  }
};

export interface ReportPdfOptions {
  /** Small text rendered on the left of every page footer. */
  footerLabel?: string;
}

const buildPdfFromNode = async (node: ReactElement, options: ReportPdfOptions = {}) => {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.background = "#ffffff";
  host.style.opacity = "0";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    flushSync(() => root.render(node));
    await waitFrame();
    await waitForAssets(host);
    await waitMs(80);

    const element = (host.firstElementChild as HTMLElement | null) ?? host;
    const height = Math.max(element.scrollHeight, element.offsetHeight, 1);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: A4_WIDTH_PX,
      height,
      windowWidth: A4_WIDTH_PX,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    });

    if (!canvas.width || !canvas.height) return null;

    const pdf = new jsPDF({
      unit: "mm",
      format: [A4_WIDTH_MM, A4_HEIGHT_MM],
      orientation: "portrait",
      compress: true,
    });

    const pxPerMM = canvas.width / A4_WIDTH_MM;
    const sliceHeightPx = Math.floor(CONTENT_HEIGHT_MM * pxPerMM);
    const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

    for (let page = 0; page < totalPages; page += 1) {
      if (page > 0) pdf.addPage();

      const offsetY = page * sliceHeightPx;
      const currentSliceHeight = Math.min(sliceHeightPx, canvas.height - offsetY);

      if (currentSliceHeight > 0) {
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = currentSliceHeight;
        const ctx = slice.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, offsetY, canvas.width, currentSliceHeight, 0, 0, canvas.width, currentSliceHeight);
          pdf.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, A4_WIDTH_MM, currentSliceHeight / pxPerMM, undefined, "FAST");
        }
      }

      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      if (options.footerLabel) {
        pdf.text(options.footerLabel.slice(0, 110), 14, A4_HEIGHT_MM - 4);
      }
      pdf.text(`Page ${page + 1} of ${totalPages}`, A4_WIDTH_MM - 14, A4_HEIGHT_MM - 4, { align: "right" });
    }

    return pdf;
  } catch (error) {
    console.error("Report PDF generation error:", error);
    return null;
  } finally {
    root.unmount();
    host.remove();
  }
};

export const downloadReportPdf = async (node: ReactElement, filename: string, options?: ReportPdfOptions) => {
  const pdf = await buildPdfFromNode(node, options);
  if (!pdf) return false;
  pdf.save(`${sanitizeDocumentFilename(filename, "document")}.pdf`);
  return true;
};

export const generateReportPdfBase64 = async (node: ReactElement, options?: ReportPdfOptions) => {
  const pdf = await buildPdfFromNode(node, options);
  if (!pdf) return null;
  return toBase64FromArrayBuffer(pdf.output("arraybuffer") as ArrayBuffer);
};

export interface ExcelSheet {
  name: string;
  rows: (string | number)[][];
}

export const downloadExcelWorkbook = (sheets: ExcelSheet[], filename: string) => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach((sheet, index) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    const safeName = (sheet.name || `Sheet${index + 1}`).replace(/[\\/?*[\]:]/g, "-").slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  });
  XLSX.writeFile(workbook, `${sanitizeDocumentFilename(filename, "report")}.xlsx`);
};

/** Convenience wrapper so callers can build nodes without importing React directly. */
export const createPrintNode = createElement;
