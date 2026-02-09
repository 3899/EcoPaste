import { type CSSProperties, forwardRef } from "react";
import { useSnapshot } from "valtio";
import LocalImage from "@/components/LocalImage";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";

interface ImageProps extends DatabaseSchemaHistory<"image"> {
  expanded?: boolean;
  onLoad?: () => void;
}

const Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { value, expanded, onLoad } = props;
  const { content } = useSnapshot(clipboardStore);

  const imageDisplayHeight = content.imageDisplayHeight || 100;

  const getImageStyle = (): CSSProperties => {
    if (expanded) {
      return {
        maxHeight: "none",
        width: "100%",
        objectFit: "contain",
      };
    }
    return {
      maxHeight: `${imageDisplayHeight}px`,
      objectFit: "contain",
    };
  };

  return <LocalImage ref={ref} style={getImageStyle()} src={value} onLoad={onLoad} />;
});

Image.displayName = "Image";

export default Image;
