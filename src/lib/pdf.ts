import html2pdf from "html2pdf.js";

export const downloadPDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: [0.2, 0.3, 0.2, 0.3],
    filename: `${filename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 800 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Generate a PDF as base64 string for email attachment
 */
export const generatePDFBase64 = (elementId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    if (!element) {
      resolve(null);
      return;
    }

    const opt = {
      margin: [0.2, 0.3, 0.2, 0.3],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 800 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("datauristring")
      .then((dataUri: string) => {
        // Strip data:application/pdf;base64, prefix
        const base64 = dataUri.split(",")[1];
        resolve(base64);
      })
      .catch(() => resolve(null));
  });
};
