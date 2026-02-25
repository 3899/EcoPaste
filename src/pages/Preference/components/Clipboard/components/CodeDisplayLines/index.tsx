import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import ProSelect from "@/components/ProSelect";
import { clipboardStore } from "@/stores/clipboard";

interface Option {
  label: string;
  value: number;
}

const CodeDisplayLines = () => {
  const { content } = useSnapshot(clipboardStore);
  const { t } = useTranslation();

  const options: Option[] = Array.from({ length: 50 }, (_, i) => i + 1).map(
    (value) => ({
      label: String(value),
      value,
    }),
  );

  return (
    <ProSelect
      description={t(
        "preference.clipboard.display_settings.hints.code_display_lines",
      )}
      onChange={(value) => {
        clipboardStore.content.codeDisplayLines = value;
      }}
      options={options}
      title={t("preference.clipboard.display_settings.label.code_display_lines")}
      value={content.codeDisplayLines || 6}
      className="w-30"
    />
  );
};

export default CodeDisplayLines;
