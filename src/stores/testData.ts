import { proxy } from "valtio";
import type { TestDataStore } from "@/types/store";

export const testDataStore = proxy<TestDataStore>({
  batches: [],
  enabled: false,
  fillShortcutBase: "Alt",
  maxRecords: 50,
  toggleShortcut: "Alt+G",
});
