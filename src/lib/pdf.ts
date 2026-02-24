import html2pdf from "html2pdf.js";

/**
 * Strict A4 PDF generation settings.
 * windowWidth 794 = 210mm at 96dpi for accurate scaling.
 * Tight margins prevent content from spilling to extra pages.
 */
const getOpts = (filename: string) => ({
  margin: [0.3, 0.25, 0.3, 0.25],
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
    unit: "in",
    format: "a4",
    orientation: "portrait" as const,
    compress: true,
  },
  pagebreak: {
    mode: ["avoid-all", "css", "legacy"],
    before: ".pdf-page-break-before",
    after: ".pdf-page-break-after",
    avoid: ["tr", "td", "th", ".pdf-no-break"],
  },
});

/**
 * Download a DOM element as a professionally formatted A4 PDF.
 */
export const downloadPDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Temporarily enforce A4 print width for consistent rendering
  const origWidth = element.style.width;
  const origMaxWidth = element.style.maxWidth;
  element.style.width = "210mm";
  element.style.maxWidth = "210mm";

  const opts = getOpts(`${filename}.pdf`);

  html2pdf()
    .set(opts)
    .from(element)
    .save()
    .then(() => {
      // Restore original styles
      element.style.width = origWidth;
      element.style.maxWidth = origMaxWidth;
    })
    .catch(() => {
      element.style.width = origWidth;
      element.style.maxWidth = origMaxWidth;
    });
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

    const origWidth = element.style.width;
    const origMaxWidth = element.style.maxWidth;
    element.style.width = "210mm";
    element.style.maxWidth = "210mm";

    const opts = getOpts("document.pdf");

    html2pdf()
      .set(opts)
      .from(element)
      .outputPdf("datauristring")
      .then((dataUri: string) => {
        element.style.width = origWidth;
        element.style.maxWidth = origMaxWidth;
        const base64 = dataUri.split(",")[1];
        resolve(base64);
      })
      .catch(() => {
        element.style.width = origWidth;
        element.style.maxWidth = origMaxWidth;
        resolve(null);
      });
  });
};
