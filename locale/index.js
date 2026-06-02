/**
 * 国际化配置文件
 * @file 提供多语言支持的核心配置
 * @module locale/index
 */


import {
	createI18n
} from "vue-i18n";
import zhHans from "./zh-Hans.json";
import zhHant from "./zh-Hant.json";
// 如果未来不要英文，直接删掉 import 和下面的配置即可
import en from "./en.json";
import {
	jumpToTabPage
} from "../utils/jumpTo";

/**
 * 支持的语言列表映射
 */
export const supportedLocales = {
	"zh-hans": "简体中文",
	"zh-hant": "繁體中文",
	"en": "English", // ✅ 如果你要删除英文，这行可以去掉
};

/**
 * 规范化语言代码格式
 * @param {string} locale - 原始语言代码
 * @returns {string|null}
 */
const normalizeLocale = (locale) => {
	if (!locale) return null;
	return locale.toLowerCase().replace("_", "-");
};

/**
 * 获取持久化存储的语言设置
 */
const getPersistedLocale = () => {
	try {
		return uni.getStorageSync("userLocale");
	} catch (e) {
		return null;
	}
};

/**
 * Vue-I18n 实例
 */
const i18n = createI18n({
	legacy: false,
	locale: getPersistedLocale() || normalizeLocale(uni.getLocale()) || "zh-hant", // ✅ 默认简体中文
	fallbackLocale: "zh-hant", // ✅ 回退简体中文
	messages: {
		"zh-hans": zhHans,
		"zh-hant": zhHant,
		"en": en, // ✅ 可以删掉
	},
});

/**
 * 切换应用语言
 */
export const setLocale = async (lang) => {
	const normalizedLang = normalizeLocale(lang);

	// 不支持的语言直接回退到 zh-hant
	if (!supportedLocales[normalizedLang]) {
		console.warn(`Language ${lang} is not supported, fallback to zh-hans`);
		i18n.global.locale.value = "zh-hant";
		uni.setLocale("zh-hant");
		uni.setStorageSync("userLocale", "zh-hant");
		return true;
	}

	i18n.global.locale.value = normalizedLang;
	uni.setLocale(normalizedLang);
	uni.setStorageSync("userLocale", normalizedLang);
	jumpToTabPage("/pages/home/home")
	return true;
};

/**
 * 获取当前语言代码
 */
export const getCurrentLocale = () => {
	return i18n.global.locale.value;
};

/**
 * 获取支持的语言列表
 */
export const getSupportedLocales = () => {
	return supportedLocales;
};

export default i18n;