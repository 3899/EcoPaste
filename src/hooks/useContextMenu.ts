import { Menu, MenuItem, type MenuItemOptions, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { downloadDir } from "@tauri-apps/api/path";
import { copyFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { openPath, openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { find, isArray, remove } from "es-toolkit/compat";
import { type MouseEvent, useContext, useRef } from "react";
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
  const { id, type, value, favorite, subtype } = data;
  const { t } = useTranslation();
  const { env } = useSnapshot(globalStore);
  const { rootState } = useContext(MainContext);
  const deleteLocalFileRef = useRef(true);

  const pasteAsText = () => {
    return pasteToClipboard(data, true);
  };

  const pasteAction = () => {
    return pasteToClipboard(data);
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

  const openToFinder = async () => {
    if (type === "text") {
      // 对于 command 子类型，使用 openPath 运行指令
      if (subtype === "command") {
        return openPath(value as string);
      }
      // 对于 path 子类型，检查是否需要展开环境变量
      const strValue = value as string;
      if (strValue.includes("%")) {
        const { expandEnvVars } = await import("@/utils/winPaths");
        const expanded = await expandEnvVars(strValue);
        return openPath(expanded);
      }
      if (strValue.toLowerCase().startsWith("shell:")) {
        return openPath(strValue);
      }
      return revealItemInDir(strValue);
    }

    if (type === "image") {
      const path = Array.isArray(value) ? value[0] : value;
      return revealItemInDir(path);
    }

    const [file] = value;

    revealItemInDir(file);
  };

  const handleDelete = async () => {
    const matched = find(rootState.list, { id });

    if (!matched) return;

    let confirmed = true;
    deleteLocalFileRef.current = true;

    if (clipboardStore.content.deleteConfirm) {
      const { Checkbox } = await import("antd");
      const { createElement } = await import("react");

      const isImage = type === "image";

      const content = createElement(
        "div",
        null,
        createElement("div", null, t("clipboard.hints.delete_modal_content")),
        isImage &&
          createElement(
            "div",
            { style: { marginTop: 8 } },
            createElement(Checkbox, {
              defaultChecked: true,
              onChange: (e: any) => {
                deleteLocalFileRef.current = e.target.checked;
              },
            }, t("clipboard.hints.delete_local_file")),
          ),
      );

      confirmed = await deleteModal.confirm({
        afterClose() {
          (document.activeElement as HTMLElement)?.blur();
        },
        centered: true,
        content,
      });
    }

    if (!confirmed) return;

    if (id === rootState.activeId) {
      handleNext();
    }

    remove(rootState.list, { id });

    deleteHistory(data, deleteLocalFileRef.current);
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

  /**
   * 根据内容类型构建分组右键菜单
   * 分组 1：复制粘贴类
   * 分组 2：操作类
   * 分组 3：编辑类
   */
  const buildMenuGroups = (): ContextMenuItem[][] => {
    // 判断具体的内容子类型
    const isUrl = subtype === "url";
    const isEmail = subtype === "email";
    const isColor = subtype === "color";
    const isPath = subtype === "path";
    const isCommand = subtype === "command";
    const isMarkdown = subtype === "markdown";
    const isCode = subtype?.startsWith("code_");

    // 通用菜单项定义
    const copy: ContextMenuItem = {
      action: () => writeToClipboard(data),
      text: t("clipboard.button.context_menu.copy"),
    };
    const paste: ContextMenuItem = {
      action: pasteAction,
      text: t("clipboard.button.context_menu.paste"),
    };
    const pastePlainText: ContextMenuItem = {
      action: pasteAsText,
      text: t("clipboard.button.context_menu.paste_as_plain_text"),
    };
    const pastePath: ContextMenuItem = {
      action: pasteAsText,
      text: t("clipboard.button.context_menu.paste_as_path"),
    };
    const edit: ContextMenuItem = {
      action: handleEdit,
      text: t("clipboard.button.context_menu.edit", "编辑"),
    };
    const fav: ContextMenuItem = {
      action: handleFavorite,
      text: favorite
        ? t("clipboard.button.context_menu.unfavorite")
        : t("clipboard.button.context_menu.favorite"),
    };
    const note: ContextMenuItem = {
      action: handleNote,
      text: t("clipboard.button.context_menu.note"),
    };
    const del: ContextMenuItem = {
      action: handleDelete,
      text: t("clipboard.button.context_menu.delete"),
    };
    const exportFile: ContextMenuItem = {
      action: exportToFile,
      text: t("clipboard.button.context_menu.export_as_file"),
    };
    const openBrowser: ContextMenuItem = {
      action: openToBrowser,
      text: t("clipboard.button.context_menu.open_in_browser"),
    };
    const sendEmail: ContextMenuItem = {
      action: () => openUrl(`mailto:${value}`),
      text: t("clipboard.button.context_menu.send_email"),
    };
    const previewImage: ContextMenuItem = {
      action: () => openPath(value as string),
      text: t("clipboard.button.context_menu.preview_image"),
    };
    const downloadImg: ContextMenuItem = {
      action: downloadImage,
      text: t("clipboard.button.context_menu.download_image"),
    };
    const showInExplorer: ContextMenuItem = {
      action: openToFinder,
      text: isMac
        ? t("clipboard.button.context_menu.show_in_finder")
        : t("clipboard.button.context_menu.show_in_file_explorer"),
    };
    const runCommand: ContextMenuItem = {
      action: () => openPath(value as string),
      text: t("clipboard.button.context_menu.run_command"),
    };
    const pasteHex: ContextMenuItem = {
      action: () => pasteColorAs("hex"),
      text: t("clipboard.button.context_menu.paste_as_hex"),
    };
    const pasteRgb: ContextMenuItem = {
      action: () => pasteColorAs("rgb"),
      text: t("clipboard.button.context_menu.paste_as_rgb"),
    };
    const pasteCmyk: ContextMenuItem = {
      action: () => pasteColorAs("cmyk"),
      text: t("clipboard.button.context_menu.paste_as_cmyk"),
    };

    // 根据类型分配菜单组
    // 图片类型
    if (type === "image") {
      return [
        [copy, paste],
        [previewImage, downloadImg, showInExplorer],
        [fav, note, del],
      ];
    }

    // 文件类型
    if (type === "files") {
      return [
        [copy, pastePath],
        [showInExplorer],
        [fav, note, del],
      ];
    }

    // 富文本类型
    if (type === "rtf") {
      return [
        [copy, paste, pastePlainText],
        [exportFile],
        [edit, fav, note, del],
      ];
    }

    // HTML 类型
    if (type === "html") {
      return [
        [copy, paste, pastePlainText],
        [exportFile],
        [edit, fav, note, del],
      ];
    }

    // 以下为 text 类型的各种子类型
    if (isUrl) {
      return [
        [copy, paste],
        [openBrowser, exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isEmail) {
      return [
        [copy, paste],
        [sendEmail, exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isColor) {
      return [
        [copy, paste],
        [pasteHex, pasteRgb, pasteCmyk, exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isPath) {
      return [
        [copy, paste],
        [showInExplorer, exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isCommand) {
      return [
        [copy, paste],
        [runCommand, exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isMarkdown) {
      return [
        [copy, paste],
        [exportFile],
        [edit, fav, note, del],
      ];
    }

    if (isCode) {
      return [
        [copy, paste],
        [exportFile],
        [edit, fav, note, del],
      ];
    }

    // 默认：纯文本
    return [
      [copy, paste],
      [exportFile],
      [edit, fav, note, del],
    ];
  };

  const handleContextMenu = async (event: MouseEvent) => {
    event.preventDefault();

    rootState.activeId = id;

    const groups = buildMenuGroups();

    const menu = await Menu.new();

    for (let gi = 0; gi < groups.length; gi++) {
      if (gi > 0) {
        const separator = await PredefinedMenuItem.new({ item: "Separator" });
        await menu.append(separator);
      }

      for (const item of groups[gi]) {
        if (item.hide) continue;
        const menuItem = await MenuItem.new(item);
        await menu.append(menuItem);
      }
    }

    menu.popup();
  };

  return {
    handleContextMenu,
    handleDelete,
    handleFavorite,
  };
};
