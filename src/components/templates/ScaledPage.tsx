import { useEffect, useRef, useState, type ReactNode } from "react";
import { A4_WIDTH_PX, A4_HEIGHT_PX } from "@/components/templates/a4";


/**
 * Responsively scales a fixed A4 (210mm x 297mm) document page down so the
 * entire page is visible on small screens. Does not affect PDF export, which
 * renders the templates off-screen at full A4 size.
 */
const ScaledPage = ({ children }: { children: ReactNode }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (!width) return;
      setScale(Math.min(1, width / A4_WIDTH_PX));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={outerRef} style={{ width: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: A4_WIDTH_PX * scale,
          height: A4_HEIGHT_PX * scale,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScaledPage;
