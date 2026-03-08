import { forwardRef, type CSSProperties } from "react";
import type { LetterheadTemplateProps } from "./LetterheadTypes";
import LetterheadPrint from "@/components/print/LetterheadPrint";

interface Props extends LetterheadTemplateProps {
  id: string;
  templateStyle?: string;
}

const PREVIEW_CANVAS_STYLE: CSSProperties = {
  width: "210mm",
  minWidth: "210mm",
  height: "297mm",
  overflow: "hidden",
  backgroundColor: "white",
  boxSizing: "border-box",
  margin: "0 auto",
};

const LetterheadPreview = forwardRef<HTMLDivElement, Props>(({ id, templateStyle = "classic", ...rest }, ref) => {
  return (
    <div id={id} ref={ref} style={PREVIEW_CANVAS_STYLE}>
      <LetterheadPrint templateStyle={templateStyle} {...rest} />
    </div>
  );
});

LetterheadPreview.displayName = "LetterheadPreview";

export default LetterheadPreview;
