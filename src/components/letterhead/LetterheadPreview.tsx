import type { LetterheadTemplateProps } from "./LetterheadTypes";
import LetterheadPrint from "@/components/print/LetterheadPrint";

interface Props extends LetterheadTemplateProps {
  id: string;
  templateStyle?: string;
}

const LetterheadPreview = ({ id, templateStyle: _templateStyle, ...rest }: Props) => {
  return (
    <div id={id}>
      <LetterheadPrint {...rest} />
    </div>
  );
};

export default LetterheadPreview;
