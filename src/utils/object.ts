import { isArray, mergeWith } from "es-toolkit/compat";

/**
 * 深度递归合并两个对象，普通对象会递归合并，其他值会直接覆盖
 * @param target 目标对象
 * @param source 源对象
 */
export const deepAssign = <T, S>(target: T, source: S): T & S => {
  return mergeWith(target, source, (targetValue, sourceValue) => {
    if (isArray(targetValue)) {
      return sourceValue;
    }
  });
};

/**
 * 严格的深度合并：仅合并在 target 中已经存在的属性
 * 用于保证向下降级兼容时，配置文件中来自于未来版本的新字段不会被合并入当前状态，导致渲染异常或崩溃
 * @param target 目标对象（基准）
 * @param source 源对象（从文件读取）
 */
export const strictDeepAssign = <T extends Record<string, any>>(target: T, source: any): T => {
  // 遍历 target 中的每一个 key，作为允许合并的“已知字段”
  for (const key of Object.keys(target)) {
    // 如果 source 中没有这个值，则保持 target 原样
    if (source?.[key] === undefined) {
      continue;
    }

    const targetVal = target[key as keyof T];
    const sourceVal = source[key];

    // 当 target 是一个原生对象（非内部数组、函数等）且 source 也是对象时，递归严格合并
    if (
      targetVal !== null &&
      typeof targetVal === "object" &&
      !isArray(targetVal)
    ) {
      if (sourceVal !== null && typeof sourceVal === "object" && !isArray(sourceVal)) {
        strictDeepAssign(targetVal, sourceVal);
      }
    } else {
      // 否则直接覆盖，对于数组也是直接覆盖
      target[key as keyof T] = sourceVal;
    }
  }

  return target;
};
