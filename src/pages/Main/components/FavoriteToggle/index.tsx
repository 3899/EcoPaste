import { useContext } from "react";
import clsx from "clsx";
import UnoIcon from "@/components/UnoIcon";
import { MainContext } from "../..";

const FavoriteToggle = () => {
  const { rootState } = useContext(MainContext);
  const isChecked = rootState.group === "favorite";

  return (
    <UnoIcon
      className={clsx("cursor-pointer transition-colors hover:text-primary", {
        "text-gold!": isChecked,
      })}
      hoverable
      name={isChecked ? "i-iconamoon:star-fill" : "i-iconamoon:star"}
      onClick={() => {
        if (isChecked) {
          rootState.group = "all"; // Toggle off
        } else {
          rootState.group = "favorite"; // Toggle on
        }
      }}
      title="收藏"
    />
  );
};

export default FavoriteToggle;
