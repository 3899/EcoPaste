import { useKeyPress } from "ahooks";
import clsx from "clsx";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Scrollbar from "@/components/Scrollbar";
import UnoIcon from "@/components/UnoIcon";
import type { DatabaseSchemaGroup } from "@/types/database";
import { scrollElementToCenter } from "@/utils/dom";
import { MainContext } from "../..";

const GroupList = () => {
  const { rootState } = useContext(MainContext);
  const { t } = useTranslation();

  useEffect(() => {
    scrollElementToCenter(rootState.group);
  }, [rootState.group]);

  const presetGroups: (DatabaseSchemaGroup & { icon: string })[] = [
    {
      icon: "i-lucide:layout-grid",
      id: "all",
      name: t("clipboard.label.tab.all"),
    },
    {
      icon: "i-lucide:type",
      id: "text",
      name: t("clipboard.label.tab.text"),
    },
    {
      icon: "i-lucide:image",
      id: "image",
      name: t("clipboard.label.tab.image"),
    },
    {
      icon: "i-lucide:link",
      id: "links",
      name: t("clipboard.label.tab.links", "链接"),
    },
    {
      icon: "i-lucide:palette",
      id: "colors",
      name: t("clipboard.label.tab.colors", "颜色"),
    },
    {
      icon: "i-lucide:mail",
      id: "email",
      name: t("clipboard.label.tab.email", "邮箱"),
    },
    {
      icon: "i-lucide:code",
      id: "code",
      name: t("clipboard.label.tab.code", "代码"),
    },
    {
      icon: "i-lucide:file-box",
      id: "files",
      name: t("clipboard.label.tab.files"),
    },
  ];

  useKeyPress("tab", (event) => {
    const index = presetGroups.findIndex((item) => item.id === rootState.group);
    const length = presetGroups.length;

    let nextIndex = index;

    if (event.shiftKey) {
      nextIndex = index === 0 ? length - 1 : index - 1;
    } else {
      nextIndex = index === length - 1 ? 0 : index + 1;
    }

    rootState.group = presetGroups[nextIndex].id;
  });

  return (
    <Scrollbar data-tauri-drag-region>
      <div className="flex gap-[10px]">
        {presetGroups.map((item) => {
          const { id, name, icon } = item;
          const isChecked = id === rootState.group;

          return (
            <UnoIcon
              className={clsx(
                "flex-shrink-0 cursor-pointer text-lg! transition-colors",
                isChecked ? "text-primary!" : "text-color-2",
              )}
              hoverable
              id={id}
              key={id}
              name={icon}
              onClick={() => {
                rootState.group = id;
              }}
              title={name}
            />
          );
        })}
      </div>
    </Scrollbar>
  );
};

export default GroupList;
