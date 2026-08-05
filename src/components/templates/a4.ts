import type { CSSProperties } from "react";

/**
 * Single source of truth for A4 page geometry.
 * Preview and the PDF pipeline MUST use these exact pixel dimensions so that
 * on-screen rendering and the exported PDF share identical margins and scaling.
 * 210mm x 297mm at 96dpi = 793.7px x 1122.5px -> rounded to 794 x 1123.
 */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export const A4_CANVAS_STYLE: CSSProperties = {
  width: `${A4_WIDTH_PX}px`,
  minWidth: `${A4_WIDTH_PX}px`,
  maxWidth: `${A4_WIDTH_PX}px`,
  height: `${A4_HEIGHT_PX}px`,
  minHeight: `${A4_HEIGHT_PX}px`,
  maxHeight: `${A4_HEIGHT_PX}px`,
  overflow: "hidden",
  backgroundColor: "white",
  boxSizing: "border-box",
  position: "relative",
  margin: "0",
};
