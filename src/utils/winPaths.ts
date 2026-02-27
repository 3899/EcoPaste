/**
 * Windows 路径与指令识别工具
 * 识别环境变量路径 (%...%)、Shell 文件夹名 (shell:...)、
 * 文件系统路径 (X:\...)、管理工具快捷指令
 */

import { invoke } from "@tauri-apps/api/core";
import { isWin } from "./is";

/**
 * 环境变量路径正则：匹配 %VAR% 或 %VAR%\... 格式
 */
const ENV_PATH_REGEX = /^%[A-Za-z_()][A-Za-z0-9_()]*%(\\.*)?$/;

/**
 * 文件系统路径正则：匹配 X:\... 或 UNC 路径 \\...
 */
const FS_PATH_REGEX = /^[A-Za-z]:[\\/]/;
const UNC_PATH_REGEX = /^\\\\[^\\]/;

/**
 * Shell 文件夹路径正则：匹配 shell:xxx 格式
 */
const SHELL_PATH_REGEX = /^shell:[a-zA-Z\s]+$/i;

/**
 * 管理工具快捷指令集合 (Win+R 可直接运行)
 */
const SYS_COMMANDS = new Set([
  // 系统核心管理
  "regedit",
  "gpedit.msc",
  "sysdm.cpl",
  "taskmgr",
  "msconfig",
  "services.msc",
  "compmgmt.msc",
  "resmon",
  // 控制面板与设置
  "control",
  "ncpa.cpl",
  "appwiz.cpl",
  "diskmgmt.msc",
  "powercfg.cpl",
  "firewall.cpl",
  "timedate.cpl",
  // 常用终端与附件
  "cmd",
  "powershell",
  "mstsc",
  "calc",
  "notepad",
  "write",
  "wordpad",
  "mspaint",
  "osk",
  "dxdiag",
]);

/**
 * God Mode 等特殊 Shell GUID 指令
 */
const SHELL_GUID_REGEX = /^shell:::\{[0-9A-Fa-f-]+\}$/;


/**
 * 检测是否为环境变量路径 (%...%)
 */
export const isEnvPath = (value: string): boolean => {
  if (!isWin) return false;
  return ENV_PATH_REGEX.test(value.trim());
};

/**
 * 检测是否为 Shell 文件夹路径 (shell:...)
 */
export const isShellPath = (value: string): boolean => {
  if (!isWin) return false;
  const trimmed = value.trim();
  return SHELL_PATH_REGEX.test(trimmed) || SHELL_GUID_REGEX.test(trimmed);
};

/**
 * 检测是否为管理工具快捷指令
 */
export const isSysCommand = (value: string): boolean => {
  if (!isWin) return false;
  return SYS_COMMANDS.has(value.trim().toLowerCase());
};


/**
 * 检测是否为文件系统路径 (X:\... 或 \\server\...)
 */
export const isFilesystemPath = (value: string): boolean => {
  if (!isWin) return false;
  const trimmed = value.trim();
  return FS_PATH_REGEX.test(trimmed) || UNC_PATH_REGEX.test(trimmed);
};

/**
 * 快速聚合检测：是否为 Windows 路径或指令
 * 用于 useClipboard.ts 中 html 分支前的精准拦截
 */
export const isWinPathOrCommand = (value: string): boolean => {
  if (!isWin) return false;
  const trimmed = value.trim();
  return (
    isFilesystemPath(trimmed) ||
    isEnvPath(trimmed) ||
    isShellPath(trimmed) ||
    isSysCommand(trimmed)
  );
};

/**
 * 展开环境变量路径中的 %VAR% 为实际路径
 * 调用 Rust 侧的 expand_env_vars 命令
 */
export const expandEnvVars = async (value: string): Promise<string> => {
  try {
    return await invoke<string>("expand_env_vars", { input: value });
  } catch {
    return value;
  }
};
