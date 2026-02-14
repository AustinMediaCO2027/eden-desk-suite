import type { LetterheadTemplateProps } from "./LetterheadTypes";
import ClassicLetterhead from "./ClassicLetterhead";
import CorporateLetterhead from "./CorporateLetterhead";
import ExecutiveLetterhead from "./ExecutiveLetterhead";

interface Props extends LetterheadTemplateProps {
  id: string;
  templateStyle?: string;
}

const LetterheadPreview = ({ id, templateStyle, ...rest }: Props) => {
  const style = templateStyle || "classic";

  const renderTemplate = () => {
    switch (style) {
      case "corporate": return <CorporateLetterhead {...rest} />;
      case "executive": return <ExecutiveLetterhead {...rest} />;
      default: return <ClassicLetterhead {...rest} />;
    }
  };

  return <div id={id}>{renderTemplate()}</div>;
};

export default LetterheadPreview;
