import { forwardRef } from "react";
import { useSnapshot } from "valtio";
import type { DatabaseSchemaHistory } from "@/types/database";
import { clipboardStore } from "@/stores/clipboard";
import { isImage } from "@/utils/is";
import File from "./components/File";

interface FilesProps extends DatabaseSchemaHistory<"files"> {
  expanded?: boolean;
}

const Files = forwardRef<HTMLDivElement, FilesProps>((props, ref) => {
  const { value, expanded } = props;
  const { content } = useSnapshot(clipboardStore);
  const filesDisplayLines = content.filesDisplayLines || 3;

  if (value.length === 1 && isImage(value[0])) {
    return (
      <div ref={ref}>
        <File count={1} path={value[0]} />
      </div>
    );
  }

  const maxHeight = expanded ? undefined : filesDisplayLines * 28;

  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={{ maxHeight }}
    >
      {value.map((path) => {
        return <File count={value.length} key={path} path={path} />;
      })}
    </div>
  );
});

Files.displayName = "Files";

export default Files;

