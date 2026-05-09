import { invoke } from "@tauri-apps/api/core";

export const COMMAND = {
  PASTE: "plugin:eco-paste|paste",
  PASTE_FAST: "plugin:eco-paste|paste_fast",
};

/**
 * 粘贴剪贴板内容
 */
export const paste = () => {
  return invoke(COMMAND.PASTE);
};

/**
 * 快速粘贴剪贴板内容
 */
export const pasteFast = () => {
  return invoke(COMMAND.PASTE_FAST);
};
