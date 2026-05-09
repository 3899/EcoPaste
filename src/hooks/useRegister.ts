import { listen } from "@tauri-apps/api/event";
import {
  isRegistered,
  register,
  type ShortcutHandler,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { useAsyncEffect, useUnmount } from "ahooks";
import { castArray } from "es-toolkit/compat";
import { useEffect, useState } from "react";
import { traceCrashEvent } from "./useCrashTrace";

export const useRegister = (
  handler: ShortcutHandler,
  deps: Array<string | string[] | undefined>,
) => {
  const [oldShortcuts, setOldShortcuts] = useState(deps[0]);

  // 双击修饰键监听：跟随 deps 变化重新订阅。
  // deps 变化的来源：Preference 窗口 onChange → store 更新 → emit(STORE_CHANGED)
  //   → Main 窗口 strictDeepAssign → snapshot 变化 → deps 更新 → useEffect 重建监听器。
  // 该同步链路近乎即时，在用户切换窗口前已完成。
  useEffect(() => {
    const [shortcuts] = deps;
    if (!shortcuts) return;

    const doubleShortcuts = castArray(shortcuts).filter((s) =>
      s.startsWith("Double_"),
    );
    if (doubleShortcuts.length === 0) return;

    let unlisten: (() => void) | undefined;

    const setup = async () => {
      unlisten = await listen<string>(
        "double_modifier_trigger",
        ({ payload }) => {
          if (doubleShortcuts.includes(payload)) {
            traceCrashEvent(`double modifier shortcut triggered: ${payload}`);
            handler({ id: 0, shortcut: payload, state: "Pressed" });
          }
        },
      );
    };

    setup();

    return () => {
      unlisten?.();
    };
  }, deps);

  useAsyncEffect(async () => {
    const [shortcuts] = deps;

    for await (const shortcut of castArray(oldShortcuts)) {
      if (!shortcut) continue;
      if (shortcut.startsWith("Double_")) continue;

      const registered = await isRegistered(shortcut);

      if (registered) {
        await unregister(shortcut);
      }
    }

    if (
      !shortcuts ||
      (typeof shortcuts === "string"
        ? shortcuts.startsWith("Double_")
        : shortcuts[0]?.startsWith("Double_"))
    ) {
      setOldShortcuts(shortcuts);
      return;
    }

    await register(shortcuts, (event) => {
      if (event.state === "Released") return;

      traceCrashEvent(`global shortcut triggered: ${event.shortcut}`);
      handler(event);
    });

    setOldShortcuts(shortcuts);
  }, deps);

  useUnmount(() => {
    const [shortcuts] = deps;

    if (
      !shortcuts ||
      (typeof shortcuts === "string"
        ? shortcuts.startsWith("Double_")
        : shortcuts[0]?.startsWith("Double_"))
    )
      return;

    unregister(shortcuts);
  });
};
