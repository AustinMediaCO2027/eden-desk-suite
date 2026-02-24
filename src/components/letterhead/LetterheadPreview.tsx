import type { LetterheadTemplateProps } from "./LetterheadTypes";
import ClassicLetterhead from "./ClassicLetterhead";
import CorporateLetterhead from "./CorporateLetterhead";
import ExecutiveLetterhead from "./ExecutiveLetterhead";

interface Props extends LetterheadTemplateProps {
  id: string;
  templateStyle?: string;
}

/**
 * Print-ready A4 letterhead wrapper.
 * Enforces strict A4 dimensions to match PDF export exactly.
 */
const A4_CONTAINER_STYLE: React.CSSProperties = {
  width: "210mm",
  height: "297mm",
  maxWidth: "210mm",
  maxHeight: "297mm",
  overflow: "hidden",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

const LetterheadPreview = ({ id, templateStyle, ...rest }: Props) => {
  const style = templateStyle || "classic";

  const renderTemplate = () => {
    switch (style) {
      case "corporate": return <CorporateLetterhead {...rest} />;
      case "executive": return <ExecutiveLetterhead {...rest} />;
      default: return <ClassicLetterhead {...rest} />;
    }
  };

  return (
    <div id={id} style={A4_CONTAINER_STYLE}>
      {renderTemplate()}
    </div>
  );
};

export default LetterheadPreview;
