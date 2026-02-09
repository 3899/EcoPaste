import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import ProSelect from "@/components/ProSelect";
import { clipboardStore } from "@/stores/clipboard";

interface Option {
  label: string;
  value: number;
}

const DisplayLines = () => {
  const { content } = useSnapshot(clipboardStore);
  const { t } = useTranslation();

  const options: Option[] = [1, 2, 3, 4, 5, 6, 8, 10].map((value) => ({
    label: String(value),
    value,
  }));

  return (
    <ProSelect
      description={t(
        "preference.clipboard.content_settings.hints.display_lines",
      )}
      onChange={(value) => {
        clipboardStore.content.displayLines = value;
      }}
      options={options}
      title={t("preference.clipboard.content_settings.label.display_lines")}
      value={content.displayLines}
      className="w-30"
    />
  );
};

export default DisplayLines;
