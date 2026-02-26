import { platform } from "@tauri-apps/plugin-os";
import { isString } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import isUrl from "is-url";

/**
 * 是否为开发环境
 */
export const isDev = () => {
  return import.meta.env.DEV;
};

/**
 * 是否为 macos 系统
 */
export const isMac = platform() === "macos";

/**
 * 是否为 windows 系统
 */
export const isWin = platform() === "windows";

/**
 * 是否为 linux 系统
 */
export const isLinux = platform() === "linux";

/**
 * 是否为链接
 */
export const isURL = (value: string) => {
  return isUrl(value);
};

/**
 * 是否为邮箱
 */
export const isEmail = (value: string) => {
  const regex = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

  return regex.test(value);
};

/**
 * 是否为颜色
 */
export const isColor = (value: string) => {
  const excludes = [
    "none",
    "currentColor",
    "-moz-initial",
    "inherit",
    "initial",
    "revert",
    "revert-layer",
    "unset",
    "ActiveBorder",
    "ActiveCaption",
    "AppWorkspace",
    "Background",
    "ButtonFace",
    "ButtonHighlight",
    "ButtonShadow",
    "ButtonText",
    "CaptionText",
    "GrayText",
    "Highlight",
    "HighlightText",
    "InactiveBorder",
    "InactiveCaption",
    "InactiveCaptionText",
    "InfoBackground",
    "InfoText",
    "Menu",
    "MenuText",
    "Scrollbar",
    "ThreeDDarkShadow",
    "ThreeDFace",
    "ThreeDHighlight",
    "ThreeDLightShadow",
    "ThreeDShadow",
    "Window",
    "WindowFrame",
    "WindowText",
  ];

  if (excludes.includes(value) || value.includes("url")) return false;

  const style = new Option().style;

  style.backgroundColor = value;
  style.backgroundImage = value;

  const { backgroundColor, backgroundImage } = style;

  return backgroundColor !== "" || backgroundImage !== "";
};

/**
 * 是否为图片
 */
export const isImage = (value: string) => {
  const regex = /\.(jpe?g|png|webp|avif|gif|svg|bmp|ico|tiff?|heic|apng)$/i;

  return regex.test(value);
};

/**
 * 是否为空白字符串
 */
export const isBlank = (value: unknown) => {
  if (isString(value)) {
    return isEmpty(value.trim());
  }

  return true;
};

/**
 * 是否为 Markdown 内容
 * 通过使用分值权重系统来检测多种 Markdown 语法特征
 */
export const isMarkdown = (value: string, threshold = 30) => {
  if (!value || typeof value !== "string" || value.length < 5) return false;

  // 核心语法及其权重
  const patterns = [
    { name: "headers", pattern: /^#{1,6}\s+.+/gm, weight: 30 },
    { name: "unordered_list", pattern: /^\s*[*+-]\s+.+/gm, weight: 20 },
    { name: "ordered_list", pattern: /^\s*\d+\.\s+.+/gm, weight: 20 },
    { name: "fenced_code", pattern: /```[\s\S]*?```/g, weight: 35 },
    { name: "inline_code", pattern: /`[^`\n]+`/g, weight: 10 },
    { name: "links", pattern: /\[.+?\]\(.+?\)/g, weight: 25 },
    { name: "images", pattern: /!\[.+?\]\(.+?\)/g, weight: 25 },
    { name: "emphasis", pattern: /(\*\*|__|\*|_).+?(\*\*|__|\*|_)/g, weight: 10 },
    { name: "blockquote", pattern: /^>\s+.+/gm, weight: 15 },
    { name: "hr", pattern: /^-{3,}\s*$/gm, weight: 10 },
    { name: "tables", pattern: /\|.+\|.+\|/g, weight: 25 },
  ];

  let totalScore = 0;

  // 执行检测
  for (const { pattern, weight } of patterns) {
    const matches = value.match(pattern);
    if (matches) {
      // 单项最高贡献 2 倍权重，防止单一符号刷分
      const contribution = Math.min(matches.length * weight, weight * 2);
      totalScore += contribution;
    }
  }

  // 结果判定
  return totalScore >= threshold;
};
