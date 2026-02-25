import hljs from "highlight.js";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { globalStore } from "@/stores/global";
import "highlight.js/styles/vs2015.css";
import "./styles.css";
import clsx from "clsx";

export interface SyntaxHighlighterProps {
  value: string;
  language?: string;
  className?: string;
  expanded?: boolean;
}

const SyntaxHighlighter = ({
  value,
  language,
  className,
  expanded = false,
}: SyntaxHighlighterProps) => {
  const { appearance } = useSnapshot(globalStore);
  const { isDark } = appearance;
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    if (!value || !language) {
      setHtmlContent("");
      return;
    }

    try {
      const highlighted = hljs.highlight(value, {
        ignoreIllegals: true,
        language: language,
      }).value;

      setHtmlContent(highlighted);
    } catch {
      setHtmlContent("");
    }
  }, [value, language, expanded]);

  // 根据主题设置样式类
  const themeClasses = isDark
    ? "bg-[#1f1f1f] text-[#cccccc]"
    : "bg-[#ffffff] text-[#333333]";

  // 添加主题类名到根元素
  const rootClasses = clsx(
    "whitespace-pre-wrap break-words font-mono text-sm leading-relaxed p-2 rounded-md",
    themeClasses,
    "font-['Maple_Mono_NF_CN',_Consolas,'Courier_New',monospace]",
    className,
    !isDark ? "light-theme" : "",
  );

  if (!htmlContent) {
    // 如果语法高亮失败，显示纯文本
    return <div className={rootClasses}>{value}</div>;
  }

  return (
    <div
      className={rootClasses}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default SyntaxHighlighter;
