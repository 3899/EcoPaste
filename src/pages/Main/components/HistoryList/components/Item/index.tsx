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
  const contentRef = useRef<HTMLDivElement>(null);

  // 检查内容是否重叠
  useEffect(() => {
    checkOverflow();
  }, [content.displayLines, content.imageDisplayHeight, value, type, rootState.search]);

  const checkOverflow = () => {
    if (!contentRef.current) return;
    
    // 对于文本类型，我们需要检查 scrollHeight 是否大于 clientHeight
    // 或者检查是否有 line-clamp 生效
    const element = contentRef.current;
    
    // 简单的溢出检查
    // 注意：由于 line-clamp 的存在，scrollHeight 可能等于 clientHeight
    // 所以我们需要一个更可靠的方法。
    // 这里我们先暂时放开高度限制让它渲染，然后测量，再一次性恢复
    
    // 但 Text 组件已经应用了 line-clamp。
    // 如果是 Image，我们检查 imageDisplayHeight
    
    if (type === "text" || type === "rtf" || type === "html") {
        // 对于文本，我们检查实际高度是否超过了理论高度
        // 理论高度 = line-height * displayLines
        // 假设 line-height 约为 1.5em (24px)
        const lineHeight = 24; 
        const maxLines = content.displayLines || 4;
        const maxHeight = lineHeight * maxLines;
        
        // 这是一个估算，更精确的方法是比较 scrollHeight > clientHeight
        // 但由于我们用了 line-clamp，clientHeight 会被限制
        setIsOverflow(element.scrollHeight > element.clientHeight + 1);
    } else if (type === "image") {
        // 对于图片，我们检查是否被限制了高度
        // Image 组件内部会应用 maxHeight
        // 这里我们可能需要 Image 组件回调或者 Ref
        // 暂时简单处理：如果图片原始高度 > 设定高度，显示展开
        // 这需要获取图片原始尺寸，比较麻烦。
        // 简便方法：Image 组件内部样式应用了 max-height，如果内容真的溢出，scrollHeight > clientHeight
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
        return <Text {...data} expanded={expanded} />;
      // rtf 和 html 暂时也用 Text 组件处理溢出逻辑，或者它们自己有实现
      case "rtf":
        return <Rtf {...data} expanded={expanded} />;
      case "html":
        return <SafeHtml {...data} expanded={expanded} />;
      case "image":
        return <Image {...data} expanded={expanded} onLoad={checkOverflow} />;
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
            // Note 模式下也受行数限制
            expanded ? "" : `line-clamp-${content.displayLines || 4}`,
          )}
        >
          <UnoIcon
            className="mr-0.5 translate-y-0.5"
            name="i-hugeicons:task-edit-01"
          />

          <Marker mark={rootState.search}>{note}</Marker>
        </div>

        <div
          ref={contentRef}
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
