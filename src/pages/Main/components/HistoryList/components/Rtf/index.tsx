import { useMount } from "ahooks";
import { type CSSProperties, forwardRef, useState } from "react";
import { EMFJS, RTFJS, WMFJS } from "rtf.js";
import { useSnapshot } from "valtio";
import SafeHtml from "@/components/SafeHtml";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";

RTFJS.loggingEnabled(false);
WMFJS.loggingEnabled(false);
EMFJS.loggingEnabled(false);

interface RtfProps extends DatabaseSchemaHistory<"rtf"> {
  expanded?: boolean;
  onLoad?: () => void;
}

const Rtf = forwardRef<HTMLDivElement, RtfProps>((props, ref) => {
  const { value, expanded, onLoad } = props;
  const { content } = useSnapshot(clipboardStore);

  const [parsedHTML, setParsedHTML] = useState("");

  const displayLines = content.displayLines || 4;

  useMount(async () => {
    const doc = new RTFJS.Document(stringToArrayBuffer(value), {});

    const elements = await doc.render();

    pt2px(elements);

    const parsedHTML = elements.map(({ outerHTML }) => outerHTML).join("");

    setParsedHTML(parsedHTML);
    onLoad?.();
  });

  const stringToArrayBuffer = (value: string) => {
    const buffer = new ArrayBuffer(value.length);

    const bufferView = new Uint8Array(buffer);

    for (let i = 0; i < value.length; i++) {
      bufferView[i] = value.charCodeAt(i);
    }

    return buffer;
  };

  const pt2px = (elements: Element[]) => {
    for (const element of elements) {
      let style = element.getAttribute("style");

      style = style?.replace(/(\d+)pt/g, "px") ?? "";

      element.setAttribute("style", style);

      pt2px([...element.children]);
    }
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
    <div ref={ref} style={getLineClampStyle()}>
      <SafeHtml value={parsedHTML} expanded={expanded} />
    </div>
  );
});

Rtf.displayName = "Rtf";

export default Rtf;
