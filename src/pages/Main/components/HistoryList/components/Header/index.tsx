import { openPath, openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { useCreation } from "ahooks";
import { Flex } from "antd";
import clsx from "clsx";
import { filesize } from "filesize";
import { type FC, type MouseEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import Scrollbar from "@/components/Scrollbar";
import UnoIcon from "@/components/UnoIcon";
import { MainContext } from "@/pages/Main";
import { transferData } from "@/pages/Preference/components/Clipboard/components/OperationButton";
import { pasteToClipboard, writeToClipboard } from "@/plugins/clipboard";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";
import type { OperationButton } from "@/types/store";
import { dayjs } from "@/utils/dayjs";

interface HeaderProps {
  data: DatabaseSchemaHistory;
  handleNote: () => void;
  handleFavorite: () => void;
  handleDelete: () => void;
  handleEdit: () => void;
}

const Header: FC<HeaderProps> = (props) => {
  const { data } = props;
  const { id, type, value, count, createTime, favorite, subtype } = data;
  const { rootState } = useContext(MainContext);
  const { t, i18n } = useTranslation();
  const { content } = useSnapshot(clipboardStore);

  const operationButtons = useCreation(() => {
    return content.operationButtons.map((key) => {
      return transferData.find((data) => data.key === key)!;
    });
  }, [content.operationButtons]);

  const renderType = () => {
    switch (subtype) {
      case "url":
        return t("clipboard.label.link");
      case "email":
        return t("clipboard.label.email");
      case "color":
        return t("clipboard.label.color");
      case "path":
        return t("clipboard.label.path");
    }

    if (subtype === "markdown") {
      return "Markdown";
    }

    if (subtype?.startsWith("code_")) {
      const lang = subtype.replace("code_", "");
      let displayLang = lang.charAt(0).toUpperCase() + lang.slice(1);
      if (lang === "cpp") displayLang = "C++";
      else if (lang === "csharp") displayLang = "C#";
      else if (lang === "javascript") displayLang = "JS";
      else if (lang === "typescript") displayLang = "TS";
      else if (lang === "html") displayLang = "HTML";
      else if (lang === "css") displayLang = "CSS";
      else if (lang === "json") displayLang = "JSON";
      else if (lang === "sql") displayLang = "SQL";

      return t("clipboard.label.code", { replace: [displayLang] });
    }

    switch (type) {
      case "text":
        return t("clipboard.label.plain_text");
      case "rtf":
        return t("clipboard.label.rtf");
      case "html":
        return t("clipboard.label.html");
      case "image":
        return t("clipboard.label.image");
      case "files":
        return t("clipboard.label.n_files", {
          replace: [value.length],
        });
    }
  };

  const renderCount = () => {
    if (type === "files" || type === "image") {
      return filesize(count, { standard: "jedec" });
    }

    return t("clipboard.label.n_chars", {
      replace: [count],
    });
  };

  const renderPixel = () => {
    if (type !== "image") return;

    const { width, height } = data;

    return (
      <span>
        {width}×{height}
      </span>
    );
  };

  const handleClick = (event: MouseEvent, key: OperationButton) => {
    const { handleNote, handleFavorite, handleDelete, handleEdit } = props;

    event.stopPropagation();

    switch (key) {
      case "copy":
        return writeToClipboard(data);
      case "pastePlain":
        return pasteToClipboard(data, true);
      case "note":
        return handleNote();
      case "star":
        return handleFavorite();
      case "delete":
        return handleDelete();
      case "openBrowser": {
        const urlStr = value as string;
        return openUrl(urlStr.startsWith("http") ? urlStr : `http://${urlStr}`);
      }
      case "previewImage":
        return openPath(value as string);
      case "edit":
        return handleEdit();
      case "openFolder":
        if (type === "text") {
          return revealItemInDir(value as string);
        } else if (type === "image") {
          const path = Array.isArray(value) ? value[0] : (value as string);
          return revealItemInDir(path);
        } else if (type === "files") {
          return revealItemInDir((value as string[])[0]);
        }
        break;
    }
  };

  return (
    <Flex
      align="center"
      className="text-color-2"
      gap="small"
      justify="space-between"
    >
      <Scrollbar thumbSize={0}>
        <Flex
          align="center"
          className="flex-1 whitespace-nowrap text-[11px]"
          gap="small"
        >
          {data.sourceAppIcon && (
            <img
              alt={data.sourceAppName}
              className="h-3.5 w-3.5 rounded-sm object-contain"
              src={data.sourceAppIcon}
              title={data.sourceAppName}
            />
          )}
          {!data.sourceAppIcon && data.sourceAppName && (
            <span className="text-12 opacity-70" title={data.sourceAppName}>
              [{data.sourceAppName}]
            </span>
          )}
          <span>{renderType()}</span>
          <span>{renderCount()}</span>
          {renderPixel()}
          <span>{dayjs(createTime).locale(i18n.language).fromNow()}</span>
        </Flex>
      </Scrollbar>

      <Flex
        align="center"
        className={clsx("opacity-0 transition group-hover:opacity-100", {
          "opacity-100": rootState.activeId === id,
        })}
        gap={6}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        {operationButtons.map((item) => {
          const { key, icon, activeIcon, title } = item;

          if (key === "openBrowser" && subtype !== "url") return null;
          if (key === "previewImage" && type !== "image") return null;
          if (key === "pastePlain" && type === "image") return null;
          if (
            key === "edit" &&
            type !== "text" &&
            type !== "html" &&
            type !== "rtf"
          )
            return null;
          if (
            key === "openFolder" &&
            type !== "files" &&
            subtype !== "path" &&
            type !== "image"
          )
            return null;

          const isFavorite = key === "star" && favorite;

          return (
            <UnoIcon
              className={clsx({ "text-gold!": isFavorite })}
              hoverable
              key={key}
              name={isFavorite ? activeIcon : icon}
              onClick={(event) => handleClick(event, key)}
              title={t(title)}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

export default Header;
