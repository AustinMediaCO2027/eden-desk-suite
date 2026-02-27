import type { CSSProperties } from "react";
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

const LetterheadPreview = ({ id, templateStyle: _templateStyle, ...rest }: Props) => {
  return (
    <div id={id} style={PREVIEW_CANVAS_STYLE}>
      <LetterheadPrint {...rest} />
    </div>
  );
};

export default LetterheadPreview;

