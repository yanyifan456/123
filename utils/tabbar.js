// tabbar.js
import {
	t
} from "@/utils/i18n.js"; // 假设你有国际化工具

// TabBar 文案和图标配置
const tabBarItems = [{
		textKey: "tabbar.home"
	},
	{
		textKey: "tabbar.health"
	},
	{
		textKey: "tabbar.message"
	},
	{
		textKey: "tabbar.mine"
	}
];

// 更新 TabBar
export const updateTabBar = () => {
	tabBarItems.forEach((item, index) => {
		uni.setTabBarItem({
			index,
			text: t(item.textKey),
		});
	});
}