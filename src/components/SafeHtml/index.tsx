import DOMPurify from "dompurify";
import { type CSSProperties, type MouseEvent, forwardRef, useContext } from "react";
import { Marker } from "react-mark.js";
import { useSnapshot } from "valtio";
import { MainContext } from "@/pages/Main";
import { clipboardStore } from "@/stores/clipboard";

interface SafeHtmlProps {
  value: string;
  expanded?: boolean;
}

const SafeHtml = forwardRef<HTMLDivElement, SafeHtmlProps>((props, ref) => {
  const { value, expanded } = props;
  const { rootState } = useContext(MainContext);
  const { content } = useSnapshot(clipboardStore);

  const displayLines = content.displayLines || 4;

  const handleClick = (event: MouseEvent) => {
    const { target, metaKey, ctrlKey } = event;

    const link = (target as HTMLElement).closest("a");

    if (!link || metaKey || ctrlKey) return;

    event.preventDefault();
    event.stopPropagation();
  };

  // 动态 line-clamp 样式
  const getLineClampStyle = (): CSSProperties => {
    if (expanded) {
      return {};
    }
    return {
      display: "-webkit-box",
      WebkitLineClamp: displayLines,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    };
  };

  return (
    <Marker mark={rootState.search}>
      <div
        ref={ref}
        className="translate-z-0"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(value, {
            FORBID_ATTR: ["target", "controls", "autoplay", "autoPlay"],
          }),
        }}
        onClick={handleClick}
        style={getLineClampStyle()}
      />
    </Marker>
  );
});

SafeHtml.displayName = "SafeHtml";

export default SafeHtml;
