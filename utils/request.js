// 统一配置
import {
	BASE_URL
} from './setting.js';

function showErrorToast(msg = "请求错误") {
	uni.showToast({
		title: msg,
		icon: "none"
	});
}

// 获取token
function getToken() {
	return uni.getStorageSync("token") || "";
}

// 请求头
function getAuthHeader() {
	const token = getToken();
	return {
		"Content-Type": "application/json",
		...(token ? {
			Authorization: `Bearer ${token}`
		} : {})
	};
}

// token过期处理
function handleTokenExpired() {
	uni.showToast({
		title: "登录已过期，请重新登录",
		icon: "none"
	})
	// 清空登录信息
	uni.clearStorageSync();
	uni.setStorageSync("privacy_status", "agreed");

	// 延迟跳转，保证 toast 能显示
	setTimeout(() => {
		uni.reLaunch({
			url: "/pages/login/login"
		});
	}, 800);
}

// 业务错误
function handleBusinessError(data, reject) {
	showErrorToast(data.msg || "业务错误");
	reject(data);
}

// 网络检测
function checkNetwork() {
	return new Promise((resolve, reject) => {
		uni.getNetworkType({
			success: (res) => {
				if (res.networkType === "none") {
					uni.showToast({
						title: "无网络，请检查网络连接",
						icon: "none"
					});
					reject({
						msg: "无网络",
						code: -1
					});
				} else {
					resolve(res.networkType);
				}
			},
			fail: () => {
				uni.showToast({
					title: "无法获取网络状态",
					icon: "none"
				});
				reject({
					msg: "无法获取网络状态",
					code: -2
				});
			}
		});
	});
}

// 核心请求函数  第二个参数非必传 但是参数必须接收
async function request(options = {}, baseUrl) {
	try {
		await checkNetwork();
	} catch (err) {
		return Promise.reject(err);
	}

	const url = (baseUrl || BASE_URL) + options.url;

	return new Promise((resolve, reject) => {
		uni.request({
			url,
			method: options.method || "GET",
			data: options.data || {},
			timeout: options.timeout || 60000,

			header: {
				...(options.noAuth ? {} : getAuthHeader()),
				...(options.header || {})
			},

			success: (res) => {
				// HTTP错误
				if (res.statusCode === 401) {
					handleTokenExpired();
					return reject(res);
				}

				if (res.statusCode !== 200) {
					showErrorToast("服务器错误");
					return reject(res);
				}

				const data = res.data;

				// token过期
				if (data.code === 401) {
					handleTokenExpired();
					return reject(data);
				}

				// 业务错误
				if (data.code != 200) {
					return handleBusinessError(data, reject);
				}

				resolve(data);
			},

			fail: (err) => {
				showErrorToast("网络请求失败，请检查网络");
				reject(err);
			}
		});
	});
}

export default request;