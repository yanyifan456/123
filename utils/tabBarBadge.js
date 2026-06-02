export const updateTabbarBadge = (index, count) => {
	if (!count || count <= 0) {
		uni.removeTabBarBadge({
			index
		});
		return;
	}

	const text = count > 99 ? '99+' : String(count);

	uni.setTabBarBadge({
		index,
		text,
		complete: (v) => {
			console.log(v);
		}
	});
};