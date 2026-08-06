import { WATERMARK_LINK_TEXT, WATERMARK_PREFIX, WATERMARK_SUFFIX, WATERMARK_URL } from "@/lib/pdf-watermark";

/**
 * On-screen preview counterpart of the free-tier PDF watermark.
 * Rendered outside the document layout flow so template structure stays untouched.
 */
const DocumentWatermark = () => (
  <div
    className="pdf-footer-watermark"
    style={{
      position: "absolute",
      bottom: "10px",
      right: "10px",
      textAlign: "right",
      fontSize: "10px",
      fontFamily: "Arial, sans-serif",
      color: "#555555",
      pointerEvents: "auto",
    }}
  >
    <span>{WATERMARK_PREFIX}</span>
    <a
      href={WATERMARK_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#000000", fontWeight: "bold", textDecoration: "underline" }}
    >
      {WATERMARK_LINK_TEXT}
    </a>
    <span>{WATERMARK_SUFFIX}</span>
  </div>
);

export default DocumentWatermark;
