import { forwardRef } from "react";
import type { LetterheadTemplateProps } from "./LetterheadTypes";
import LetterheadPrint from "@/components/print/LetterheadPrint";
import ScaledPage from "@/components/templates/ScaledPage";
import { A4_CANVAS_STYLE } from "@/components/templates/a4";
import DocumentWatermark from "@/components/templates/DocumentWatermark";
import { useSubscription } from "@/hooks/useSubscription";

interface Props extends LetterheadTemplateProps {
  id: string;
  templateStyle?: string;
}

const LetterheadPreview = forwardRef<HTMLDivElement, Props>(({ id, templateStyle = "classic", ...rest }, ref) => {
  const { isPaid } = useSubscription();
  return (
    <ScaledPage>
      <div id={id} ref={ref} className="a4-canvas" style={A4_CANVAS_STYLE}>
        <LetterheadPrint templateStyle={templateStyle} {...rest} />
        {!isPaid && <DocumentWatermark />}
      </div>
    </ScaledPage>
  );
});



LetterheadPreview.displayName = "LetterheadPreview";

export default LetterheadPreview;
