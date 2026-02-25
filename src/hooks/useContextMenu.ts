import { Menu, MenuItem, type MenuItemOptions } from "@tauri-apps/api/menu";
import { downloadDir } from "@tauri-apps/api/path";
import { copyFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { find, isArray, remove } from "es-toolkit/compat";
import { type MouseEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import { deleteHistory, updateHistory } from "@/database/history";
import { MainContext } from "@/pages/Main";
import type { ItemProps } from "@/pages/Main/components/HistoryList/components/Item";
import { pasteToClipboard, writeToClipboard } from "@/plugins/clipboard";
import { clipboardStore } from "@/stores/clipboard";
import { globalStore } from "@/stores/global";
import { isMac } from "@/utils/is";
import { join } from "@/utils/path";

interface UseContextMenuProps extends ItemProps {
  handleNext: () => void;
}

interface ContextMenuItem extends MenuItemOptions {
  hide?: boolean;
}

export const useContextMenu = (props: UseContextMenuProps) => {
  const { data, deleteModal, handleNote, handleEdit, handleNext } = props;
  const { id, type, value, group, favorite, subtype } = data;
  const { t } = useTranslation();
  const { env } = useSnapshot(globalStore);
  const { rootState } = useContext(MainContext);

  const pasteAsText = () => {
    return pasteToClipboard(data, true);
  };

  const handleFavorite = async () => {
    const nextFavorite = !favorite;

    const matched = find(rootState.list, { id });

    if (!matched) return;

    matched.favorite = nextFavorite;

    updateHistory(id, { favorite: nextFavorite });
  };

  const openToBrowser = () => {
    if (type !== "text") return;

    const url = value.startsWith("http") ? value : `http://${value}`;

    openUrl(url);
  };

  const exportToFile = async () => {
    if (isArray(value)) return;

    const extname = type === "text" ? "txt" : type;
    const fileName = `${env.appName}_${id}.${extname}`;
    const path = join(await downloadDir(), fileName);

    await writeTextFile(path, value);

    revealItemInDir(path);
  };

  const downloadImage = async () => {
    if (type !== "image") return;

    const fileName = `${env.appName}_${id}.png`;
    const path = join(await downloadDir(), fileName);

    await copyFile(value, path);

    revealItemInDir(path);
  };

  const openToFinder = () => {
    if (type === "text") {
      return revealItemInDir(value);
    }

    const [file] = value;

    revealItemInDir(file);
  };

  const handleDelete = async () => {
    const matched = find(rootState.list, { id });

    if (!matched) return;

    let confirmed = true;

    if (clipboardStore.content.deleteConfirm) {
      confirmed = await deleteModal.confirm({
        afterClose() {
          // 关闭确认框后焦点还在，需要手动取消焦点
          (document.activeElement as HTMLElement)?.blur();
        },
        centered: true,
        content: t("clipboard.hints.delete_modal_content"),
      });
    }

    if (!confirmed) return;

    if (id === rootState.activeId) {
      handleNext();
    }

    remove(rootState.list, { id });

    deleteHistory(data);
  };

  const pasteColorAs = async (format: "hex" | "rgb" | "cmyk") => {
    if (subtype !== "color" || !value) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = value as string;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

    let result = value as string;
    if (format === "hex") {
      const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
      result =
        a < 255
          ? `#${hex}${a.toString(16).padStart(2, "0")}`.toUpperCase()
          : `#${hex}`.toUpperCase();
    } else if (format === "rgb") {
      result =
        a < 255
          ? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
          : `rgb(${r}, ${g}, ${b})`;
    } else if (format === "cmyk") {
      let c = 1 - r / 255;
      let m = 1 - g / 255;
      let y = 1 - b / 255;
      const k = Math.min(c, m, y);
      if (k === 1) {
        result = "cmyk(0%, 0%, 0%, 100%)";
      } else {
        c = Math.round(((c - k) / (1 - k)) * 100);
        m = Math.round(((m - k) / (1 - k)) * 100);
        y = Math.round(((y - k) / (1 - k)) * 100);
        const kPct = Math.round(k * 100);
        result = `cmyk(${c}%, ${m}%, ${y}%, ${kPct}%)`;
      }
    }

    const { writeText } = await import("tauri-plugin-clipboard-x-api");
    const { paste } = await import("@/plugins/paste");
    const { hideWindow } = await import("@/plugins/window");

    await writeText(result);
    hideWindow();
    await paste();
  };

  const handleContextMenu = async (event: MouseEvent) => {
    event.preventDefault();

    rootState.activeId = id;

    const items: ContextMenuItem[] = [
      {
        action: () => writeToClipboard(data),
        text: t("clipboard.button.context_menu.copy"),
      },
      {
        action: handleNote,
        text: t("clipboard.button.context_menu.note"),
      },
      {
        action: handleEdit,
        hide: type !== "text" && type !== "html" && type !== "rtf",
        text: t("clipboard.button.context_menu.edit", "编辑"),
      },
      {
        action: pasteAsText,
        hide: type !== "html" && type !== "rtf",
        text: t("clipboard.button.context_menu.paste_as_plain_text"),
      },
      {
        action: pasteAsText,
        hide: type !== "files",
        text: t("clipboard.button.context_menu.paste_as_path"),
      },
      {
        action: () => pasteColorAs("hex"),
        hide: subtype !== "color",
        text: t("clipboard.button.context_menu.paste_as_hex", "转为 HEX 并粘贴"),
      },
      {
        action: () => pasteColorAs("rgb"),
        hide: subtype !== "color",
        text: t("clipboard.button.context_menu.paste_as_rgb", "转为 RGB 并粘贴"),
      },
      {
        action: () => pasteColorAs("cmyk"),
        hide: subtype !== "color",
        text: t("clipboard.button.context_menu.paste_as_cmyk", "转为 CMYK 并粘贴"),
      },
      {
        action: handleFavorite,
        text: favorite
          ? t("clipboard.button.context_menu.unfavorite")
          : t("clipboard.button.context_menu.favorite"),
      },
      {
        action: openToBrowser,
        hide: subtype !== "url",
        text: t("clipboard.button.context_menu.open_in_browser"),
      },
      {
        action: () => openUrl(`mailto:${value}`),
        hide: subtype !== "email",
        text: t("clipboard.button.context_menu.send_email"),
      },
      {
        action: exportToFile,
        hide: group !== "text",
        text: t("clipboard.button.context_menu.export_as_file"),
      },
      {
        action: downloadImage,
        hide: type !== "image",
        text: t("clipboard.button.context_menu.download_image"),
      },
      {
        action: openToFinder,
        hide: type !== "files" && subtype !== "path",
        text: isMac
          ? t("clipboard.button.context_menu.show_in_finder")
          : t("clipboard.button.context_menu.show_in_file_explorer"),
      },
      {
        action: handleDelete,
        text: t("clipboard.button.context_menu.delete"),
      },
    ];

    const menu = await Menu.new();

    for await (const item of items.filter(({ hide }) => !hide)) {
      const menuItem = await MenuItem.new(item);

      await menu.append(menuItem);
    }

    menu.popup();
  };

  return {
    handleContextMenu,
    handleDelete,
    handleFavorite,
  };
};
