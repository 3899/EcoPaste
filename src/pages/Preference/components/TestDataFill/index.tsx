import { Button, Flex, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import ProList from "@/components/ProList";
import ProListItem from "@/components/ProListItem";
import ProShortcut from "@/components/ProShortcut";
import ProSwitch from "@/components/ProSwitch";
import { testDataStore } from "@/stores/testData";
import type { TestDataBatch, TestDataField } from "@/types/store";
import {
  clearBatches,
  createBatch,
  testDataProviders,
} from "@/utils/testDataFill";

const TestDataFill = () => {
  const { t } = useTranslation();
  const testData = useSnapshot(testDataStore);

  const fieldLabel = (field: TestDataField) => {
    return t(`preference.test_data.field.${field}`, {
      defaultValue:
        testDataProviders.find((provider) => provider.field === field)?.label ??
        field,
    });
  };

  const columns: ColumnsType<TestDataBatch> = [
    {
      dataIndex: "createTime",
      title: t("preference.test_data.record.time", "生成时间"),
      width: 160,
    },
    {
      render: (_, record) => (
        <Flex gap="small" vertical>
          {testDataProviders.map((provider) => {
            const value = record.values[provider.field];

            return (
              <Space key={provider.field} size="small" wrap>
                <Tag>{fieldLabel(provider.field)}</Tag>
                <Typography.Text copyable={{ text: value }}>
                  {value}
                </Typography.Text>
              </Space>
            );
          })}
        </Flex>
      ),
      title: t("preference.test_data.record.values", "数据"),
    },
  ];

  return (
    <>
      <ProList header={t("preference.test_data.title", "测试数据填充")}>
        <ProSwitch
          checked={testData.enabled}
          description={t(
            "preference.test_data.hints.enabled",
            "开启后可使用字段快捷键直接填入当前输入框，每次从关闭切换为开启都会生成新批次。",
          )}
          onChange={(value) => {
            testDataStore.enabled = value;
            if (value) {
              createBatch();
            }
          }}
          title={t("preference.test_data.label.enabled", "启用填充模式")}
        />

        <ProShortcut
          description={t(
            "preference.test_data.hints.toggle_shortcut",
            "用于快速开启或关闭测试数据填充模式。",
          )}
          onChange={(value) => {
            testDataStore.toggleShortcut = value;
          }}
          title={t(
            "preference.test_data.label.toggle_shortcut",
            "模式切换快捷键",
          )}
          value={testData.toggleShortcut}
        />

        <ProListItem
          description={t(
            "preference.test_data.hints.mapping",
            "填充模式开启后，在目标输入框内使用这些快捷键填入对应字段。",
          )}
          title={t("preference.test_data.label.mapping", "字段快捷键")}
        >
          <Space size={[8, 8]} wrap>
            {testDataProviders.map((provider) => (
              <Tag color="blue" key={provider.field}>
                {testData.fillShortcutBase}+{provider.shortcutIndex}:{" "}
                {fieldLabel(provider.field)}
              </Tag>
            ))}
          </Space>
        </ProListItem>

        <ProListItem
          description={t(
            "preference.test_data.hints.record",
            "记录独立保存，不会写入普通剪贴板历史。",
          )}
          title={t("preference.test_data.label.record", "生成记录")}
        >
          <Space>
            <Button onClick={() => createBatch()} size="small">
              {t("preference.test_data.button.generate", "生成一批")}
            </Button>
            <Button danger onClick={() => clearBatches()} size="small">
              {t("preference.test_data.button.clear", "清空记录")}
            </Button>
          </Space>
        </ProListItem>
      </ProList>

      <ProList header={t("preference.test_data.record.title", "最近生成")}>
        <Table
          columns={columns}
          dataSource={[...testData.batches] as TestDataBatch[]}
          locale={{
            emptyText: t("preference.test_data.record.empty", "暂无记录"),
          }}
          pagination={{ pageSize: 5, size: "small" }}
          rowKey="id"
          size="small"
        />
      </ProList>
    </>
  );
};

export default TestDataFill;
