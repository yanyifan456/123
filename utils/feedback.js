/**
 * 用户反馈工具集
 * @file 封装常用的用户交互反馈
 * @module utils/feedback
 */
import {
	t
} from "./i18n";
/**
 * 显示轻提示
 * @param {string} title - 提示内容
 * @param {number} [duration=2000] - 显示时长(ms)
 * @param {'success'|'loading'|'none'|'error'} [icon='none'] - 图标类型
 */
export const showToast = (title, duration = 2000, icon = 'none') => {
	uni.showToast({
		title,
		icon,
		duration,
		mask: true // 防止穿透点击
	});
};

/**
 * 显示加载提示
 * @param {string} [title='加载中...'] - 提示内容
 * @param {boolean} [mask=true] - 是否显示遮罩
 */
export const showLoading = (title = '加载中...', mask = true) => {
	uni.showLoading({
		title,
		mask
	});
};

/**
 * 隐藏加载提示
 */
export const hideLoading = () => {
	uni.hideLoading();
};

/**
 * 显示模态对话框
 * @param {string} title - 标题
 * @param {string} [content=''] - 内容
 * @param {boolean} [showCancel=true] - 是否显示取消按钮
 * @returns {Promise<boolean>} 用户是否确认
 */
export const showModal = (title, content = '', showCancel = true) => {
	return new Promise((resolve) => {
		uni.showModal({
			title,
			content,
			showCancel,
			confirmColor: "#459767",
			confirmText: t("public.confirm"),
			cancelColor: "#181b19",
			cancelText: t("public.cancel"),
			success: (res) => {
				resolve(res.confirm);
			}
		});
	});
};

/**
 * 显示操作菜单
 * @param {string[]} itemList - 按钮文字数组
 * @returns {Promise<number>} 用户点击的按钮索引
 */
export const showActionSheet = (itemList) => {
	return new Promise((resolve, reject) => {
		uni.showActionSheet({
			itemList,
			success: (res) => {
				resolve(res.tapIndex);
			},
			fail: (err) => {
				reject(err);
			}
		});
	});
};

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {string} [successTip=''] - 复制成功后的提示语（为空则不提示）
 */
export const copyText = (text, successTip = '') => {
	uni.setClipboardData({
		data: text,
		success: () => {
			if (successTip) showToast(successTip);
		}
	});
};

export default {
	showToast,
	showLoading,
	hideLoading,
	showModal,
	showActionSheet,
	copyText
};