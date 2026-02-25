import MDEditor from "@uiw/react-md-editor";
import { useBoolean } from "ahooks";
import { Form, Input, Modal, Select } from "antd";
import { find } from "es-toolkit/compat";
import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import CodeEditor from "@/components/CodeEditor";
import ColorPicker from "@/components/ColorPicker";
import { updateHistory } from "@/database/history";
import { MainContext } from "@/pages/Main";
import { globalStore } from "@/stores/global";
import type { DatabaseSchemaHistory } from "@/types/database";

export interface EditModalRef {
  open: (id: string) => void;
}

interface FormFields {
  content: string;
}

// 支持的文本类型选项
// 使用复合 key 格式 "type|subtype" 来区分同 type 不同 subtype 的选项
const TEXT_TYPE_OPTIONS = [
  { label: "纯文本", value: "text|" },
  { label: "富文本", value: "rtf|" },
  { label: "HTML", value: "html|" },
  { label: "链接", value: "text|url" },
  { label: "邮箱", value: "text|email" },
  { label: "路径", value: "text|path" },
  { label: "颜色", value: "text|color" },
  { label: "代码", value: "code|" },
];

// 从复合 value 中解析 type 和 subtype（用于保存到数据库）
const parseTypeValue = (value: string): { type: string; subtype?: string } => {
  const [type, subtype] = value.split("|");
  return {
    subtype: subtype || undefined,
    type: type || "text",
  };
};

// 从数据库的 type 和 subtype 获取对应的 Select value
const getSelectValue = (type: string, subtype?: string): string => {
  const subtypeStr = subtype || "";
  const option = TEXT_TYPE_OPTIONS.find((opt) => {
    const [optType, optSubtype] = opt.value.split("|");
    return optType === type && optSubtype === subtypeStr;
  });

  // 兼容处理：如果颜色类型存储为 type=text, subtype=color
  if (!option && type === "text" && subtype === "color") {
    return "text|color";
  }

  if (option) {
    return option.value;
  }
  return `${type}|`;
};

// 支持的代码语言选项
const CODE_LANGUAGE_OPTIONS = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Scala", value: "scala" },
  { label: "SQL", value: "sql" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
  { label: "Bash", value: "bash" },
  { label: "Shell", value: "shell" },
  { label: "PowerShell", value: "powershell" },
];

const EditModal = forwardRef<EditModalRef>((_, ref) => {
  const { t } = useTranslation();
  const { rootState } = useContext(MainContext);
  const { appearance } = useSnapshot(globalStore);
  const isDark = appearance.isDark;
  const [open, { toggle, setFalse }] = useBoolean();
  const [item, setItem] = useState<DatabaseSchemaHistory>();
  const [form] = Form.useForm<FormFields>();
  const [content, setContent] = useState<string>("");
  // 当前选择的文本类型
  const [selectedType, setSelectedType] = useState<string>("text|");
  // 当前选择的子类型（用于 text 类型下的 markdown/color/url 等）
  const [_selectedSubtype, setSelectedSubtype] = useState<string | undefined>();
  // 当前选择的代码语言（仅当类型为代码时使用）
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState<string>("");
  // 当前选择的颜色格式（仅当类型为颜色时使用）
  const [selectedColorFormat, setSelectedColorFormat] = useState<
    "hex" | "rgb" | "cmyk"
  >("hex");

  // 获取剪贴板内容的可编辑形式
  const getEditableContent = (item: DatabaseSchemaHistory): string => {
    if (!item) return "";

    if (Array.isArray(item.value)) {
      return JSON.stringify(item.value);
    }
    return item.value || "";
  };

  // 初始化类型选择
  const initializeTypeSelection = (item: DatabaseSchemaHistory) => {
    if (!item) return;

    // 如果是代码类型，设置对应的选项
    if (item.subtype?.startsWith("code_")) {
      setSelectedType("code|");
      setSelectedCodeLanguage(item.subtype.replace("code_", ""));
      setSelectedSubtype(undefined);
    } else {
      // text/formatted 类型使用 getSelectValue 获取复合 value
      setSelectedType(getSelectValue(item.type || "text", item.subtype));
      setSelectedSubtype(item.subtype || undefined);
      setSelectedCodeLanguage("");
    }
  };

  // 处理文本类型变化
  const handleTypeChange = (value: string) => {
    const { type, subtype } = parseTypeValue(value);
    setSelectedType(value);
    setSelectedSubtype(subtype);
    // 如果不是代码类型，清空代码语言选择
    if (type !== "code") {
      setSelectedCodeLanguage("");
    }
    // 如果不是颜色类型，重置颜色格式
    if (subtype !== "color") {
      setSelectedColorFormat("hex");
    }
  };

  // 处理代码语言变化
  const handleCodeLanguageChange = (language: string) => {
    setSelectedCodeLanguage(language);
  };

  // 判断是否使用代码编辑器
  const shouldUseCodeEditor = () => {
    return selectedType.startsWith("code|") && selectedCodeLanguage;
  };

  // 判断是否使用Markdown编辑器
  const shouldUseMarkdownEditor = () => {
    return selectedType.startsWith("rtf|") || selectedType.startsWith("html|");
  };

  // 判断是否使用颜色选择器
  const shouldUseColorPicker = () => {
    return selectedType === "text|color";
  };

  // 获取当前代码语言
  const getCurrentCodeLanguage = () => {
    if (selectedType.startsWith("code|") && selectedCodeLanguage) {
      return selectedCodeLanguage;
    }
    return undefined;
  };

  useImperativeHandle(ref, () => ({
    open: (id: string) => {
      const findItem = find(rootState.list, { id });

      // 只允许编辑可以进行文本编辑的内容
      if (findItem && ["text", "rtf", "html"].includes(findItem.type)) {
        const editableContent = getEditableContent(findItem);

        setContent(editableContent);
        form.setFieldsValue({
          content: editableContent,
        });

        setItem(findItem);
        // 初始化类型选择
        initializeTypeSelection(findItem);
        toggle();
      }
    },
  }));

  const handleOk = async () => {
    const { content: formContent } = form.getFieldsValue();

    if (item) {
      const { id } = item;

      // 从复合 value 中解析出 type 和 subtype
      const { type: parsedType, subtype: parsedSubtype } =
        parseTypeValue(selectedType);

      // 根据选择的类型更新对应的值
      let updateSubtype: string | undefined = parsedSubtype;

      if (parsedType === "code") {
        updateSubtype = `code_${selectedCodeLanguage}`; // 语言存储在 subtype 中
      }

      // 保存原始值用于比较
      const originalValue = item.value;
      const originalSubtype = item.subtype;

      // 如果是从 ColorPicker 来的内容，保证存为字符串
      const valueStr = String(formContent);

      // 找到需要更新的内存项
      const itemIndex = rootState.list.findIndex(
        (listItem) => listItem.id === item.id,
      );

      // 只有值或subtype变化了才更新
      if (originalValue !== valueStr || originalSubtype !== updateSubtype) {
        // 更新本地状态
        if (itemIndex !== -1) {
          rootState.list[itemIndex].value = valueStr;
          rootState.list[itemIndex].search = valueStr;
          rootState.list[itemIndex].subtype = updateSubtype;
        }

        // 调用数据库更新
        await updateHistory(id, {
          search: valueStr,
          subtype: updateSubtype, // 更新分类信息
          value: valueStr,
        });
      }
    }

    setFalse();
  };

  return (
    <Modal
      centered
      destroyOnClose
      onCancel={setFalse}
      onOk={handleOk}
      open={open}
      title={t("clipboard.button.context_menu.edit", "编辑内容")}
      width={900}
    >
      <Form form={form} initialValues={{ content }} onFinish={handleOk}>
        {/* 类型选择区域 */}
        <Form.Item className="mb-4">
          <div className="flex gap-2">
            <Select
              onChange={handleTypeChange}
              options={TEXT_TYPE_OPTIONS}
              style={{ width: 120 }}
              value={selectedType}
            />
            {selectedType.startsWith("code|") && (
              <Select
                onChange={handleCodeLanguageChange}
                options={CODE_LANGUAGE_OPTIONS}
                placeholder="选择语言"
                style={{ width: 150 }}
                value={selectedCodeLanguage}
              />
            )}
          </div>
        </Form.Item>

        {/* 编辑器区域 */}
        <Form.Item className="mb-0!" name="content">
          {shouldUseCodeEditor() ? (
            <CodeEditor
              codeLanguage={getCurrentCodeLanguage()}
              editable={true}
              onChange={setContent}
              value={content}
            />
          ) : shouldUseMarkdownEditor() ? (
            <div data-color-mode={isDark ? "dark" : "light"}>
              <MDEditor
                height={350}
                onChange={(val) => setContent(val || "")}
                value={content}
              />
            </div>
          ) : shouldUseColorPicker() ? (
            <ColorPicker
              format={selectedColorFormat}
              onChange={(c) => {
                setContent(c);
                form.setFieldValue("content", c);
              }}
              value={content}
            />
          ) : (
            <Input.TextArea
              autoSize={{ maxRows: 20, minRows: 10 }}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入内容"
              value={content}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
});

EditModal.displayName = "EditModal";

export default EditModal;
