import { openPath } from "@tauri-apps/plugin-opener";
import { Flex } from "antd";
import type { HookAPI } from "antd/es/modal/useModal";
import clsx from "clsx";
import { type FC, useContext, useEffect, useRef, useState } from "react";
import { Marker } from "react-mark.js";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import SafeHtml from "@/components/SafeHtml";
import UnoIcon from "@/components/UnoIcon";
import { LISTEN_KEY } from "@/constants";
import { useContextMenu } from "@/hooks/useContextMenu";
import { MainContext } from "@/pages/Main";
import { pasteToClipboard } from "@/plugins/clipboard";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";
import Files from "../Files";
import Header from "../Header";
import Image from "../Image";
import Rtf from "../Rtf";
import Text from "../Text";

export interface ItemProps {
  index: number;
  data: DatabaseSchemaHistory;
  deleteModal: HookAPI;
  handleNote: () => void;
}

const Item: FC<ItemProps> = (props) => {
  const { index, data, handleNote } = props;
  const { id, type, note, value } = data;
  const { rootState } = useContext(MainContext);
  const { content } = useSnapshot(clipboardStore);
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement | HTMLImageElement>(null);

  // 检查内容是否重叠
  useEffect(() => {
    checkOverflow();
  }, [content.displayLines, content.imageDisplayHeight, value, type, rootState.search]);

  const checkOverflow = () => {
    if (!contentRef.current) {
      setIsOverflow(false);
      return;
    }
    
    const element = contentRef.current;
    
    if (element instanceof HTMLImageElement) {
        // 图片：检查原始高度是否大于当前渲染高度
        // +1 是为了容错
        setIsOverflow(element.naturalHeight > element.clientHeight + 1);
    } else {
        // 文本：检查 scrollHeight 是否大于 clientHeight
        setIsOverflow(element.scrollHeight > element.clientHeight + 1);
    }
  };

  const handlePreview = () => {
    if (type !== "image") return;

    openPath(value);
  };

  const handleNext = () => {
    const { list } = rootState;

    const nextItem = list[index + 1] ?? list[index - 1];

    rootState.activeId = nextItem?.id;
  };

  const handlePrev = () => {
    if (index === 0) return;

    rootState.activeId = rootState.list[index - 1].id;
  };

  rootState.eventBus?.useSubscription((payload) => {
    if (payload.id !== id) return;

    const { handleDelete, handleFavorite } = rest;

    switch (payload.action) {
      case LISTEN_KEY.CLIPBOARD_ITEM_PREVIEW:
        return handlePreview();
      case LISTEN_KEY.CLIPBOARD_ITEM_PASTE:
        return pasteToClipboard(data);
      case LISTEN_KEY.CLIPBOARD_ITEM_DELETE:
        return handleDelete();
      case LISTEN_KEY.CLIPBOARD_ITEM_SELECT_PREV:
        return handlePrev();
      case LISTEN_KEY.CLIPBOARD_ITEM_SELECT_NEXT:
        return handleNext();
      case LISTEN_KEY.CLIPBOARD_ITEM_FAVORITE:
        return handleFavorite();
    }
  });

  const { handleContextMenu, ...rest } = useContextMenu({
    ...props,
    handleNext,
  });

  const handleClick = (type: typeof content.autoPaste) => {
    // 检查是否有选中文本，如果有则不触发粘贴
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    rootState.activeId = id;

    if (content.autoPaste !== type) return;

    pasteToClipboard(data);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const renderContent = () => {
    switch (type) {
      case "text":
        return <Text ref={contentRef as any} {...data} expanded={expanded} />;
      case "rtf":
        return <Rtf ref={contentRef as any} {...data} expanded={expanded} onLoad={checkOverflow} />;
      case "html":
        return <SafeHtml ref={contentRef as any} {...data} expanded={expanded} />;
      case "image":
        return <Image ref={contentRef as any} {...data} expanded={expanded} onLoad={checkOverflow} />;
      case "files":
        return <Files {...data} />;
    }
  };

  return (
    <Flex
      className={clsx(
        "group b hover:b-primary-5 b-color-2 mx-3 rounded-md p-1.5 transition",
        {
          "b-primary bg-primary-1": rootState.activeId === id,
        },
      )}
      gap={4}
      onClick={() => handleClick("single")}
      onContextMenu={handleContextMenu}
      onDoubleClick={() => handleClick("double")}
      vertical
    >
      <Header {...rest} data={data} handleNote={handleNote} />

      <div className="relative flex-1 select-auto overflow-hidden break-words children:transition">
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 children:inline opacity-0",
            {
              "group-hover:opacity-0": content.showOriginalContent,
              "opacity-100": note,
            },
          )}
          style={{
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? "none" : content.displayLines || 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <UnoIcon
            className="mr-0.5 translate-y-0.5"
            name="i-hugeicons:task-edit-01"
          />

          <Marker mark={rootState.search}>{note}</Marker>
        </div>

        <div
          className={clsx("h-full", {
            "group-hover:opacity-100": content.showOriginalContent,
            "opacity-0": note,
          })}
        >
          {renderContent()}
        </div>
      </div>

      {/* 展开/收起按钮 */}
      {isOverflow && (
        <div
          className="flex cursor-pointer items-center justify-center text-xs text-primary hover:text-primary-6"
          onClick={handleToggleExpand}
        >
          <UnoIcon
            className="mr-1"
            name={expanded ? "i-lucide:chevron-up" : "i-lucide:chevron-down"}
          />
          <span>
            {expanded
              ? t("preference.clipboard.content_settings.label.collapse")
              : t("preference.clipboard.content_settings.label.expand")}
          </span>
        </div>
      )}
    </Flex>
  );
};

export default Item;
