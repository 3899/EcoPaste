import { invoke } from "@tauri-apps/api/core";
import { nanoid } from "nanoid";
import { writeText } from "tauri-plugin-clipboard-x-api";
import { pasteFast } from "@/plugins/paste";
import { testDataStore } from "@/stores/testData";
import type { TestDataBatch, TestDataField } from "@/types/store";
import { formatDate } from "./dayjs";

export interface TestDataProvider {
  field: TestDataField;
  label: string;
  shortcutIndex: number;
  generate: () => string;
}

const FAMILY_NAMES = [
  "赵",
  "钱",
  "孙",
  "李",
  "周",
  "吴",
  "郑",
  "王",
  "冯",
  "陈",
  "褚",
  "卫",
  "蒋",
  "沈",
  "韩",
  "杨",
  "朱",
  "秦",
  "许",
  "何",
  "吕",
  "施",
  "张",
  "孔",
  "曹",
  "严",
  "华",
  "金",
  "魏",
  "陶",
  "姜",
];

const GIVEN_NAMES = [
  "子轩",
  "浩然",
  "梓涵",
  "宇航",
  "一诺",
  "欣怡",
  "雨桐",
  "思源",
  "嘉怡",
  "晨曦",
  "明哲",
  "若曦",
  "俊杰",
  "诗涵",
  "博文",
  "雅婷",
];

const AREA_CODES = [
  "110101",
  "120101",
  "310101",
  "440103",
  "440305",
  "500103",
  "510104",
  "330102",
  "320102",
  "420102",
  "610102",
  "350102",
];

const PHONE_PREFIXES = [
  "130",
  "131",
  "132",
  "135",
  "136",
  "137",
  "138",
  "139",
  "150",
  "151",
  "152",
  "157",
  "158",
  "159",
  "166",
  "172",
  "178",
  "180",
  "181",
  "182",
  "183",
  "185",
  "186",
  "187",
  "188",
  "198",
];

const SOCIAL_CREDIT_BASE = "0123456789ABCDEFGHJKLMNPQRTUWXY";
const SOCIAL_CREDIT_WEIGHTS = [
  1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28,
];

const BANK_PREFIXES = ["622202", "622848", "622700", "621483", "622588"];

const pick = <T>(items: T[]) => items[randomInt(0, items.length - 1)];

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomDigits = (length: number) => {
  let value = "";
  for (let index = 0; index < length; index++) {
    value += randomInt(0, 9);
  }
  return value;
};

const pad = (value: number) => value.toString().padStart(2, "0");

const generateName = () => `${pick(FAMILY_NAMES)}${pick(GIVEN_NAMES)}`;

const generatePhone = () => `${pick(PHONE_PREFIXES)}${randomDigits(8)}`;

const generateBirthDate = () => {
  const year = randomInt(1975, 2004);
  const month = randomInt(1, 12);
  const day = randomInt(1, new Date(year, month, 0).getDate());

  return `${year}${pad(month)}${pad(day)}`;
};

const generateIdCard = () => {
  const body = `${pick(AREA_CODES)}${generateBirthDate()}${randomDigits(3)}`;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checks = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  const sum = body
    .split("")
    .reduce((total, value, index) => total + Number(value) * weights[index], 0);

  return `${body}${checks[sum % 11]}`;
};

const generateSocialCreditCode = () => {
  const body =
    pick(["91", "92", "93"]) +
    pick(AREA_CODES) +
    Array.from(
      { length: 9 },
      () => SOCIAL_CREDIT_BASE[randomInt(0, SOCIAL_CREDIT_BASE.length - 1)],
    ).join("");
  const sum = body
    .split("")
    .reduce(
      (total, value, index) =>
        total +
        SOCIAL_CREDIT_BASE.indexOf(value) * SOCIAL_CREDIT_WEIGHTS[index],
      0,
    );
  const checkIndex = (31 - (sum % 31)) % 31;

  return `${body}${SOCIAL_CREDIT_BASE[checkIndex]}`;
};

const luhnCheckDigit = (body: string) => {
  const sum = body
    .split("")
    .reverse()
    .reduce((total, value, index) => {
      let digit = Number(value);
      if (index % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      return total + digit;
    }, 0);

  return String((10 - (sum % 10)) % 10);
};

const generateBankCard = () => {
  const body = `${pick(BANK_PREFIXES)}${randomDigits(12)}`;

  return `${body}${luhnCheckDigit(body)}`;
};

export const testDataProviders: TestDataProvider[] = [
  {
    field: "idCard",
    generate: generateIdCard,
    label: "身份证",
    shortcutIndex: 1,
  },
  {
    field: "phone",
    generate: generatePhone,
    label: "手机号",
    shortcutIndex: 2,
  },
  { field: "name", generate: generateName, label: "姓名", shortcutIndex: 3 },
  {
    field: "socialCreditCode",
    generate: generateSocialCreditCode,
    label: "统一社会信用代码",
    shortcutIndex: 4,
  },
  {
    field: "bankCard",
    generate: generateBankCard,
    label: "银行卡号",
    shortcutIndex: 5,
  },
];

export const createBatch = (): TestDataBatch => {
  const values = Object.fromEntries(
    testDataProviders.map((provider) => [provider.field, provider.generate()]),
  ) as TestDataBatch["values"];
  const batch = {
    createTime: formatDate(),
    id: nanoid(),
    values,
  };

  testDataStore.batches.unshift(batch);
  testDataStore.currentBatchId = batch.id;

  if (testDataStore.maxRecords > 0) {
    testDataStore.batches.splice(testDataStore.maxRecords);
  }

  return batch;
};

export const getCurrentBatch = () => {
  return testDataStore.batches.find(
    ({ id }) => id === testDataStore.currentBatchId,
  );
};

export const listBatches = () => testDataStore.batches;

export const clearBatches = () => {
  testDataStore.batches = [];
  testDataStore.currentBatchId = undefined;
};

export const pasteField = async (field: TestDataField) => {
  const batch = getCurrentBatch() ?? createBatch();
  const value = batch.values[field];

  if (!value) return;

  invoke("append_crash_event", {
    message: `test data paste field=${field}, batch=${batch.id}`,
  }).catch(() => {});

  await writeText(value);
  await pasteFast();
};
