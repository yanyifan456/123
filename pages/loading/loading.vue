<template>
	<view class="page loading"></view>
</template>

<script setup>
import { onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
onShow(() => {
	initApp();
});

/**
 * =========================
 * 初始化入口
 * =========================
 */
const initApp = async () => {
	try {
		// 1️⃣ 检查版本更新
		// await checkUpdate();

		// 2️⃣ 检查登录状态
		const token = uni.getStorageSync("token");

		if (token) {
			// 3️⃣ 刷新 token（可选）
			await refreshToken();

			// 4️⃣ 获取用户信息
			await getUserInfo();

			// 👉 进入首页
			goHome();
		} else {
			goLogin();
		}
	} catch (e) {
		console.log("初始化异常", e);
		goLogin();
	}
};

/**
 * =========================
 * 版本更新
 * =========================
 */
const checkUpdate = () => {
	return new Promise((resolve) => {
		// #ifdef APP-PLUS
		plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
			const currentVersion = widgetInfo.version;

			getServerVersion().then((server) => {
				if (compareVersion(server.version, currentVersion)) {
					showUpdateModal(server, resolve);
				} else {
					resolve();
				}
			});
		});
		// #endif

		// #ifndef APP-PLUS
		resolve();
		// #endif
	});
};

// 👉 模拟接口（换成你自己的）
const getServerVersion = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				version: "1.1.0",
				force: false,
				url: "https://your-app-download-url.com",
				desc: "修复已知问题，优化体验",
			});
		}, 300);
	});
};

// 👉 版本比较
const compareVersion = (newV, oldV) => {
	const n = newV.split(".");
	const o = oldV.split(".");

	for (let i = 0; i < n.length; i++) {
		if (parseInt(n[i]) > parseInt(o[i] || 0)) return true;
		if (parseInt(n[i]) < parseInt(o[i] || 0)) return false;
	}
	return false;
};

// 👉 更新弹窗
const showUpdateModal = (data, resolve) => {
	uni.showModal({
		title: "发现新版本",
		content: data.desc,
		showCancel: !data.force,
		confirmText: "立即更新",
		cancelText: "稍后再说",
		success: (res) => {
			if (res.confirm) {
				plus.runtime.openURL(data.url);
			} else {
				if (!data.force) resolve();
			}
		},
	});
};

/**
 * =========================
 * 登录相关
 * =========================
 */

// 👉 刷新 token（示例）
const refreshToken = () => {
	return new Promise((resolve) => {
		// 这里换成你的接口
		setTimeout(() => {
			console.log("刷新 token");
			resolve();
		}, 200);
	});
};

// 👉 获取用户信息
const getUserInfo = () => {
	return new Promise((resolve) => {
		// 这里换成你的接口
		setTimeout(() => {
			console.log("获取用户信息");
			resolve();
		}, 200);
	});
};

/**
 * =========================
 * 页面跳转
 * =========================
 */
const goHome = () => {
	uni.reLaunch({
		url: "/pages/home/home",
	});
};

const goLogin = () => {
	uni.reLaunch({
		url: "/pages/login/login",
	});
};
</script>

<style lang="scss">
.loading {
	height: 100%;
	width: 100%;
	background: url("/static/images/loadingPage.png") no-repeat;
	background-size: 100% 100%;
}
</style>
