import { convertFileSrc } from "@tauri-apps/api/core";
import { type HTMLAttributes, forwardRef } from "react";

interface LocalImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
}

const LocalImage = forwardRef<HTMLImageElement, LocalImageProps>((props, ref) => {
  const { src, ...rest } = props;

  return <img ref={ref} {...rest} src={convertFileSrc(src)} />;
});

LocalImage.displayName = "LocalImage";

export default LocalImage;
