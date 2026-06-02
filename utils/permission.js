/**
 * 权限工具类
 */

// ======================
// 蓝牙权限检测
// ======================
export const checkBluetoothPermission = () => {
	// #ifdef APP-PLUS
	try {
		const main = plus.android.runtimeMainActivity();
		const PackageManager = plus.android.importClass(
			"android.content.pm.PackageManager"
		);

		const permission = "android.permission.ACCESS_FINE_LOCATION";

		const result = main.checkSelfPermission(permission);

		return result === PackageManager.PERMISSION_GRANTED;
	} catch (e) {
		console.log("检测权限异常", e);
		return false;
	}
	// #endif

	return true;
};

// ======================
// 是否开启通知
// ======================
export const checkNotificationPermission = () => {
	// #ifdef APP-PLUS
	if (plus.os.name === "iOS") {
		return true; // iOS 无法直接判断
	} else {
		try {
			const main = plus.android.runtimeMainActivity();
			const NotificationManagerCompat = plus.android.importClass(
				"androidx.core.app.NotificationManagerCompat"
			);

			return NotificationManagerCompat.from(main).areNotificationsEnabled();
		} catch (e) {
			return true;
		}
	}
	// #endif

	return true;
};

// ======================
// 跳转系统设置页
// ======================
export const openAppSetting = () => {
	// #ifdef APP-PLUS
	if (plus.os.name === "Android") {
		const main = plus.android.runtimeMainActivity();
		const Intent = plus.android.importClass("android.content.Intent");
		const Settings = plus.android.importClass("android.provider.Settings");

		const intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
		const Uri = plus.android.importClass("android.net.Uri");
		const uri = Uri.fromParts("package", main.getPackageName(), null);

		intent.setData(uri);
		main.startActivity(intent);
	} else {
		plus.runtime.openURL("app-settings:");
	}
	// #endif
};