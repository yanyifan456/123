// utils/navigation.js
/**
 * 动态设置导航栏
 * @param {string} title - 导航栏标题
 * @param {string} backgroundColor - 背景色，格式 #RRGGBB
 */
export function setNavigationBar(
	title = "",
	backgroundColor = "#fafbff"
) {
	// 计算亮度决定文字颜色
	const r = parseInt(backgroundColor.slice(1, 3), 16);
	const g = parseInt(backgroundColor.slice(3, 5), 16);
	const b = parseInt(backgroundColor.slice(5, 7), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	const frontColor = brightness > 186 ? "#000000" : "#ffffff";

	// 设置颜色
	uni.setNavigationBarColor({
		frontColor,
		backgroundColor,
		animation: {
			duration: 300,
			timingFunc: "easeInOut"
		},
	});

	// 设置标题文字
	uni.setNavigationBarTitle({
		title
	});
}