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

  // CMYK 格式无法被浏览器 CSS 引擎识别，需要通过正则前置判断
  if (/^cmyk\(\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/i.test(value)) {
    return true;
  }

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
 * 通过使用分值权重系统和负向惩罚机制来检测多种 Markdown 语法特征
 */
export const isMarkdown = (value: string, threshold = 35) => {
  if (!value || typeof value !== "string" || value.length < 5) return false;

  // 1. 负面特征检测 (Negative Constraints)
  let codePenalty = 0;
  
  const braceBlocks = (value.match(/\{[\s\S]{1,50}?\}/g) || []).length;
  const semicolons = (value.match(/;\s*$/gm) || []).length;
  const jsKeywords = (value.match(/\b(function|var|const|let|return|define|exports)\b/g) || []).length;
  
  const totalCodeHits = braceBlocks + semicolons + jsKeywords;
  if (totalCodeHits > 10) {
    codePenalty = totalCodeHits * 5;
  }

  // 2. 核心语法及其权重
  const patterns = [
    { name: "headers", pattern: /^#{1,6}\s+[^\n]+/gm, weight: 30 },
    { name: "unordered_list", pattern: /^\s*[*+-]\s+[^\n]{1,200}$/gm, weight: 20 },
    { name: "ordered_list", pattern: /^\s*\d+\.\s+[^\n]{1,200}$/gm, weight: 20 },
    { name: "fenced_code", pattern: /^```[a-zA-Z0-9]*\s*[\s\S]+?^```/gm, weight: 40 },
    { name: "links", pattern: /(?:^|[^a-zA-Z0-9_$])\[[^\]\n]+\]\([^\s)(]+\)/g, weight: 25 },
    { name: "images", pattern: /!\[[^\]\n]*\]\([^\s)(]+\)/g, weight: 25 },
    { name: "emphasis", pattern: /(?<![a-zA-Z0-9_])(\*\*|__)[^\s].+?[^\s]\1(?![a-zA-Z0-9_])/g, weight: 10 },
    { name: "blockquote", pattern: /^>\s+.+/gm, weight: 15 },
    { name: "table_separator", pattern: /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/gm, weight: 40 },
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

  // 计算最终得分
  const finalScore = totalScore - codePenalty;

  // 结果判定
  return finalScore >= threshold;
};

