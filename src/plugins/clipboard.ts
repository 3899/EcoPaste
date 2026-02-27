import { exists } from "@tauri-apps/plugin-fs";
import {
  writeFiles,
  writeHTML,
  writeImage,
  writeRTF,
  writeText,
} from "tauri-plugin-clipboard-x-api";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";
import { isColor, isEmail, isMarkdown, isURL } from "@/utils/is";
import { detectCode } from "@/utils/isCode";
import { isEnvPath, isShellPath, isSysCommand } from "@/utils/winPaths";
import { paste } from "./paste";
import { hideWindow } from "./window";

export const getClipboardTextSubtype = async (value: string) => {
  try {
    if (isURL(value)) {
      return "url";
    }

    if (isEmail(value)) {
      return "email";
    }

    if (isColor(value)) {
      return "color";
    }

    // Windows 特殊路径与指令检测
    if (isEnvPath(value) || isShellPath(value)) {
      return "path";
    }

    if (isSysCommand(value)) {
      return "command";
    }

    if (await exists(value)) {
      return "path";
    }

    // Markdown detection: check for common markdown patterns
    if (isMarkdown(value)) {
      return "markdown";
    }

    const codeDetect = detectCode(value);
    if (codeDetect.isCode && codeDetect.language) {
      return `code_${codeDetect.language}`;
    }
  } catch {
    return;
  }
};

export const writeToClipboard = (data: DatabaseSchemaHistory) => {
  const { type, value, search } = data;

  switch (type) {
    case "text":
      return writeText(value);
    case "rtf":
      return writeRTF(search, value);
    case "html":
      return writeHTML(search, value);
    case "image":
      return writeImage(value);
    case "files":
      return writeFiles(value);
  }
};

export const pasteToClipboard = async (
  data: DatabaseSchemaHistory,
  asPlain?: boolean,
) => {
  const { type, value, search } = data;
  const { pastePlain } = clipboardStore.content;

  if (asPlain ?? pastePlain) {
    if (type === "files") {
      await writeText(value.join("\n"));
    } else {
      await writeText(search);
    }
  } else {
    await writeToClipboard(data);
  }

  hideWindow();

  return paste();
};
