import { proxy } from "valtio";
import type { ClipboardStore } from "@/types/store";

export const clipboardStore = proxy<ClipboardStore>({
  audio: {
    copy: false,
  },

  content: {
    recordSourceApp: true,
    enableCodeHighlighting: true,
    autoFavorite: false,
    autoPaste: "double",
    autoSort: false,
    copyPlain: false,
    deleteConfirm: true,
    operationButtons: ["copy", "star", "delete"],
    pastePlain: false,
    showOriginalContent: false,
    displayLines: 4,
    codeDisplayLines: 6,
    filesDisplayLines: 3,
    imageDisplayHeight: 100,
    defaultCollapse: false,
  },

  history: {
    duration: 0,
    maxCount: 0,
    unit: 1,
  },

  search: {
    autoClear: false,
    defaultFocus: false,
    position: "top",
  },
  webdav: {
    autoStrategy: "off",
    fullSchedule: {
      mode: "interval",
      fixedHour: 0,
      fixedMinute: 0,
      fixedRepeat: "daily",
      intervalMinutes: 60,
      cronExpression: "",
    },
    slimSchedule: {
      mode: "interval",
      fixedHour: 0,
      fixedMinute: 0,
      fixedRepeat: "daily",
      intervalMinutes: 15,
      cronExpression: "",
    },
    lastBackupAt: void 0,
    lastBackupError: void 0,
    lastBackupStatus: "none",
    manualSlim: false,
    maxBackups: 0,
  },
  window: {
    backTop: false,
    position: "remember",
    showAll: false,
    style: "standard",
  },
});
