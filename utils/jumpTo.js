/**
 * 跳转方法封装
 */

// 跳转到下一个小程序
export const jumpToMiniProgram = () => {
	uni.navigateToMiniProgram({
		appId: "wx2a50f35dddd63c88",
		envVersion: "develop",
		success: (res) => {
			console.log("跳转成功");
		},
		fail: (err) => {
			console.error("跳转失败", err);
		},
	});
}


// 跳转到下一个页面
export const jumpToNextPage = (url) => {
	uni.navigateTo({
		url,
		success: (res) => {
			console.log("跳转到下一个页面 success", res);
		},
		fail: (err) => {
			console.log("跳转到下一个页面 fail", err);
		}
	})
}
// 跳转到tabbar页面
export const jumpToTabPage = (url) => {
	uni.switchTab({
		url,
		success: (res) => {
			console.log("跳转到下一个页面 success", res);
		},
		fail: (err) => {
			console.log("跳转到下一个页面 fail", err);
		}
	})
}
// 返回上一层
export const jumpBackPage = (delta = 1) => {
	uni.navigateBack({
		delta, // 默认返回上一层
		success: (res) => {
			console.log("返回 success", res);
		},
		fail: (err) => {
			console.log("返回 fail", err);
		}
	});
};