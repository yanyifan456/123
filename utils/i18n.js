/**
 * 全局翻译函数
 * @file 提供 setup 之外也能用的 t 函数
 */

import i18n from "@/locale/index"; // ✅ 注意这里是默认导出

/**
 * 全局可用的 t 函数
 * @param {string} key - 多语言 key
 * @param  {...any} args - 格式化参数
 * @returns {string}
 */
export const t = (key, ...args) => {
  return i18n.global.t(key, ...args);
};
