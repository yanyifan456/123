/**
 * 设置原生 App 状态栏样式
 * @param {Object} options
 * @param {('#000000'|'#ffffff')} options.fontStyle - 状态栏字体颜色，'000000' 黑色 / 'ffffff' 白色
 * @param {string} options.backgroundColor - 状态栏背景颜色，支持十六进制 #RRGGBB 暂不支持设置
 */
export function setStatusBar({
	fontStyle = 'dark'
} = {}) {
	// 仅在 App（原生）端生效
	// if (process.env.UNI_PLATFORM !== 'app-plus') {
	// 	console.warn('setStatusBar 仅在原生 App 端生效');
	// 	return;
	// }

	// 设置字体颜色
	uni.setNavigationBarColor({
		frontColor: fontStyle, // '000000' / 'ffffff'
		success() {
			console.log('状态栏字体颜色设置成功');
		},
		fail(err) {
			console.error('状态栏字体颜色设置失败', err);
		}
	});

	// 设置状态栏背景色
	// uni.setStatusBarBackgroundColor({
	// 	color: backgroundColor,
	// 	success() {
	// 		console.log('状态栏背景颜色设置成功');
	// 	},
	// 	fail(err) {
	// 		console.error('状态栏背景颜色设置失败', err);
	// 	}
	// });
}