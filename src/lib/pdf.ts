import html2pdf from "html2pdf.js";

/**
 * Print-ready A4 PDF generation.
 * Forces strict A4 dimensions (210mm × 297mm) with overflow hidden
 * to guarantee single-page output. Separates screen layout from print layout.
 */

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";

const getOpts = (filename: string) => ({
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

/**
 * Enforce strict A4 print layout on an element before PDF capture.
 * Returns a cleanup function to restore original styles.
 */
const enforceA4 = (element: HTMLElement) => {
  const orig = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
    minHeight: element.style.minHeight,
    overflow: element.style.overflow,
    boxSizing: element.style.boxSizing,
  };

  element.style.width = A4_WIDTH;
  element.style.maxWidth = A4_WIDTH;
  element.style.height = A4_HEIGHT;
  element.style.maxHeight = A4_HEIGHT;
  element.style.minHeight = A4_HEIGHT;
  element.style.overflow = "hidden";
  element.style.boxSizing = "border-box";

  return () => {
    element.style.width = orig.width;
    element.style.maxWidth = orig.maxWidth;
    element.style.height = orig.height;
    element.style.maxHeight = orig.maxHeight;
    element.style.minHeight = orig.minHeight;
    element.style.overflow = orig.overflow;
    element.style.boxSizing = orig.boxSizing;
  };
};

/**
 * Download a DOM element as a professionally formatted single-page A4 PDF.
 */
export const downloadPDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const restore = enforceA4(element);
  const opts = getOpts(`${filename}.pdf`);

  html2pdf()
    .set(opts)
    .from(element)
    .save()
    .then(() => restore())
    .catch(() => restore());
};

/**
 * Generate a PDF as base64 string for email attachment.
 */
export const generatePDFBase64 = (elementId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    if (!element) {
      resolve(null);
      return;
    }

    const restore = enforceA4(element);
    const opts = getOpts("document.pdf");

    html2pdf()
      .set(opts)
      .from(element)
      .outputPdf("datauristring")
      .then((dataUri: string) => {
        restore();
        const base64 = dataUri.split(",")[1];
        resolve(base64);
      })
      .catch(() => {
        restore();
        resolve(null);
      });
  });
};
