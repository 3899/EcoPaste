import { InputNumber } from "antd";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import ProListItem from "@/components/ProListItem";
import { clipboardStore } from "@/stores/clipboard";

const ImageDisplayHeight = () => {
  const { content } = useSnapshot(clipboardStore);
  const { t } = useTranslation();

  return (
    <ProListItem
      description={t(
        "preference.clipboard.content_settings.hints.image_display_height",
      )}
      title={t(
        "preference.clipboard.content_settings.label.image_display_height",
      )}
    >
      <InputNumber
        addonAfter={t(
          "preference.clipboard.content_settings.label.image_display_height_unit",
        )}
        className="w-30"
        min={50}
        max={500}
        onChange={(value) => {
          if (value !== null) {
            clipboardStore.content.imageDisplayHeight = value;
          }
        }}
        value={content.imageDisplayHeight}
      />
    </ProListItem>
  );
};

export default ImageDisplayHeight;
