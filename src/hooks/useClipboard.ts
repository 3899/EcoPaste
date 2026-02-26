import { invoke } from "@tauri-apps/api/core";
import { useMount } from "ahooks";
import { cloneDeep } from "es-toolkit";
import { isEmpty, remove } from "es-toolkit/compat";
import { nanoid } from "nanoid";
import {
  type ClipboardChangeOptions,
  onClipboardChange,
  startListening,
} from "tauri-plugin-clipboard-x-api";
import { fullName } from "tauri-plugin-fs-pro-api";
import {
  insertHistory,
  selectHistory,
  updateHistory,
} from "@/database/history";
import type { State } from "@/pages/Main";
import { getClipboardTextSubtype } from "@/plugins/clipboard";
import { clipboardStore } from "@/stores/clipboard";
import type { DatabaseSchemaHistory } from "@/types/database";
import { formatDate } from "@/utils/dayjs";

export const useClipboard = (
  state: State,
  options?: ClipboardChangeOptions,
) => {
  useMount(async () => {
    await startListening();

    let isProcessing = false;

    onClipboardChange(async (result) => {
      if (isProcessing) return;
      isProcessing = true;

      try {
      const { files, image, html, rtf, text } = result;

      if (isEmpty(result) || Object.values(result).every(isEmpty)) return;

      const { copyPlain } = clipboardStore.content;

      const data = {
        createTime: formatDate(),
        favorite: false,
        group: "text",
        id: nanoid(),
        search: text?.value,
      } as DatabaseSchemaHistory;

      if (files) {
        // 如果文件都是图片且有图片数据，优先识别为图片（如截图工具）
        const imageExtensions =
          /\.(png|jpg|jpeg|gif|bmp|webp|svg|ico|tiff?|avif)$/i;
        const allFilesAreImages =
          files.value.length > 0 &&
          files.value.every((f: string) => imageExtensions.test(f));

        if (allFilesAreImages && image) {
          Object.assign(data, image, {
            group: "image",
          });
        } else {
          Object.assign(data, files, {
            group: "files",
            search: files.value.join(" "),
          });
        }
      } else if (image) {
        // Excel/Sheets 复制单元格时会同时提供 image + html + text
        // 此时应优先使用 html 而非 image
        if (html && text && !copyPlain) {
          Object.assign(data, html);
        } else {
          // 还原 v0.5.0 逻辑：图片优先于 HTML/RTF
          // 从网页复制图片时，浏览器会同时提供 HTML + Image 格式
          // 优先识别为图片，避免被误判为 HTML
          Object.assign(data, image, {
            group: "image",
          });
        }
      } else if (html && !copyPlain) {
        Object.assign(data, html);
      } else if (rtf && !copyPlain) {
        Object.assign(data, rtf);
      } else if (text) {
        const subtype = await getClipboardTextSubtype(text.value);

        Object.assign(data, text, {
          subtype,
        });
      }

      if (clipboardStore.content.recordSourceApp) {
        try {
          const appInfo: any = await invoke("get_source_app_info");
          if (appInfo?.appName) {
            data.sourceAppName = appInfo.appName;
            if (appInfo.appIcon) {
              data.sourceAppIcon = appInfo.appIcon;
            }
          }
        } catch {
        }
      }

      const sqlData = cloneDeep(data);

      const { type, value, group, createTime } = data;

      if (type === "image") {
        const fileName = await fullName(value);

        try {
          const { getDefaultSaveImagePath } = await import(
            "tauri-plugin-clipboard-x-api"
          );
          const { getSaveImagePath, join } = await import("@/utils/path");
          const { copyFile, exists, remove, mkdir } = await import(
            "@tauri-apps/plugin-fs"
          );

          const defaultSavePath = await getDefaultSaveImagePath();
          const customSavePath = getSaveImagePath();

          if (defaultSavePath !== customSavePath) {
            const originalFilePath = join(defaultSavePath, fileName);
            const customFilePath = join(customSavePath, fileName);

            if (await exists(originalFilePath)) {
              if (!(await exists(customSavePath))) {
                await mkdir(customSavePath, { recursive: true });
              }
              await copyFile(originalFilePath, customFilePath);
              await remove(originalFilePath);
              data.value = customFilePath;
            }
          }
        } catch {
        }

        sqlData.value = fileName;
      }

      if (type === "files") {
        sqlData.value = JSON.stringify(value);
      }

      const [matched] = await selectHistory((qb) => {
        const { type, value } = sqlData;

        return qb.where("type", "=", type).where("value", "=", value);
      });

      const visible = state.group === "all" || state.group === group;

      if (matched) {
        if (!clipboardStore.content.autoSort) return;

        const { id } = matched;

        if (visible) {
          remove(state.list, { id });

          state.list.unshift({ ...data, id });
        }

        return updateHistory(id, { createTime });
      }

      if (visible) {
        state.list.unshift(data);
      }

      insertHistory(sqlData);
      } finally {
        isProcessing = false;
      }
    }, options);
  });
};
