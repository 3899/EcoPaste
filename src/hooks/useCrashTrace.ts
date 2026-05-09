import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEventListener, useMount } from "ahooks";
import { isString } from "es-toolkit";

const appendCrashEvent = (message: string) => {
  invoke("append_crash_event", { message }).catch(() => {});
};

const stringifyReason = (reason: unknown) => {
  if (isString(reason)) return reason;

  if (reason instanceof Error) {
    return `${reason.name}: ${reason.message}`;
  }

  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
};

export const traceCrashEvent = appendCrashEvent;

export const useCrashTrace = () => {
  useMount(() => {
    const appWindow = getCurrentWebviewWindow();

    appendCrashEvent(`app mounted: label=${appWindow.label}`);

    appWindow
      .onFocusChanged(({ payload }) => {
        appendCrashEvent(
          `frontend focus changed: label=${appWindow.label}, focused=${payload}`,
        );
      })
      .catch(() => {});
  });

  useEventListener("visibilitychange", () => {
    appendCrashEvent(
      `document visibility changed: ${document.visibilityState}`,
    );
  });

  useEventListener("focus", () => {
    appendCrashEvent("browser window focused");
  });

  useEventListener("blur", () => {
    appendCrashEvent("browser window blurred");
  });

  useEventListener("error", (event) => {
    appendCrashEvent(
      `frontend error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
    );
  });

  useEventListener("unhandledrejection", ({ reason }) => {
    appendCrashEvent(`frontend unhandledrejection: ${stringifyReason(reason)}`);
  });
};
