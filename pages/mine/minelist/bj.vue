<template>
	<view class="containers">
		<!-- 表單區域 -->
		<view class="form-wrapper">
			<!-- 收件人 -->
			<view class="form-item">
				<view class="form-label">收件人</view>
				<text class="form-text">{{ formData.reciveUsername }}</text>
			</view>

			<!-- 手機號 -->
			<view class="form-item">
				<view class="form-label">手機號</view>
				<view class="phone-input-wrapper">
					<text class="phone-prefix">{{ selectedCountryCode }}</text>
					<text class="phone-divider">|</text>
					<text class="form-text">{{ formData.reciveTel }}</text>
				</view>
			</view>

			<!-- 配送地區 -->
			<view class="form-item">
				<view class="form-label">配送地區</view>
				<view class="region-select">
					<text class="region-text">{{ selectedRegionText || "請選擇地區" }}</text>
					<text class="arrow-icon">></text>
				</view>
			</view>

			<!-- 詳細地址 -->
			<view class="form-item form-item-last">
				<view class="form-label">詳細地址</view>
				<input
					class="form-input"
					type="text"
					v-model="formData.reciveAddress"
					placeholder="請輸入詳細地址"
					placeholder-class="placeholder-text"
				/>
			</view>
			<view class="form-item form-item-last">
				<view class="form-label">设置为默认</view>

				<switch
					style="margin-left: 350rpx"
					:checked="formData.defaultTag === '1'"
					@change="handleSwitchChange"
					color="#52AE7B"
				/>
			</view>
		</view>

		<!-- 保存按鈕 -->
		<view class="save-btn-wrapper">
			<button class="save-btn" @click="handleSave">保存</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { showToast, showModal } from "@/utils/feedback.js";
import { jumpToNextPage } from "@/utils/jumpTo";
import { onLoad, onNavigationBarButtonTap } from "@dcloudio/uni-app";
import { setNavigationBar } from "@/utils/navigation";
import { updreciveaddress, getregiontree, countryList } from "@/api/yyf.js";
onNavigationBarButtonTap((e) => {
	console.log("🚀 ~ e:", e);
	handleDelete();
});

// 地址ID
const addressId = ref(null);

// 表單數據
const formData = reactive({
	reciveUsername: "",
	reciveTel: "",
	reciveRegion: "",
	reciveAddress: "",
	defaultTag: "0",
	regionCode: "",
	delTag: "0",
});

// 國家區號選擇相關
const countryListData = ref([]);
const selectedCountry = ref(null);
const selectedCountryCode = computed(() => {
	return selectedCountry.value?.countryCode || "+86";
});

// 地區選擇相關
const regionTreeData = ref(null);
const selectedRegionText = ref("");

onLoad((options) => {
	console.log(options);
	if (options.id) {
		addressId.value = options.id;
	}
	if (options.reciveUsername) {
		formData.reciveUsername = decodeURIComponent(options.reciveUsername);
	}
	if (options.reciveTel) {
		formData.reciveTel = options.reciveTel;
	}
	if (options.defaultTag) {
		formData.defaultTag = options.defaultTag;
	}
	if (options.reciveAddress) {
		formData.reciveAddress = decodeURIComponent(options.reciveAddress);
	}
	if (options.reciveRegion) {
		formData.reciveRegion = options.reciveRegion;
	}
	if (options.regionCode) {
		formData.regionCode = options.regionCode;
	}
	if (options.regionText) {
		selectedRegionText.value = decodeURIComponent(options.regionText);
	}

	getCountryList();
	getRegionText();
});

// 獲取國家列表
const getCountryList = async () => {
	try {
		const res = await countryList({});
		if (res.code === "200") {
			countryListData.value = res.data.data || [];
			// 根據reciveRegion找到對應的國家
			const country = countryListData.value.find((item) => item.id.toString() === formData.reciveRegion);
			if (country) {
				selectedCountry.value = country;
			} else {
				// 默認選中中國大陸
				const china = countryListData.value.find((item) => item.countryCode === "+86");
				if (china) {
					selectedCountry.value = china;
				}
			}
		}
	} catch (error) {
		console.log("獲取國家列表失敗");
	}
};
const handleSwitchChange = (e) => {
	formData.defaultTag = e.detail.value ? "1" : "0";
};
// 獲取地區文本
const getRegionText = async () => {
	if (selectedRegionText.value) return;
	if (!formData.regionCode) return;

	try {
		const res = await getregiontree();
		if (res.code === "200") {
			regionTreeData.value = res.data.data;
			// 遞歸查找地區名稱
			const regionText = findRegionText(res.data.data, formData.regionCode);
			if (regionText) {
				selectedRegionText.value = regionText;
			}
		}
	} catch (error) {
		console.log("獲取地區數據失敗");
	}
};

// 遞歸查找地區文本
const findRegionText = (node, targetCode, path = []) => {
	if (!node) return null;

	if (node.region && node.region.regionCode === targetCode) {
		return [...path, node.region.regionName].join("");
	}

	if (node.children && node.children.length > 0) {
		for (const child of node.children) {
			const newPath = node.region ? [...path, node.region.regionName] : path;
			const result = findRegionText(child, targetCode, newPath);
			if (result) return result;
		}
	}

	return null;
};

// 返回上一頁
const goBack = () => {
	uni.navigateBack();
};

// 刪除地址
const handleDelete = async () => {
	const confirmed = await showModal("確定要刪除該地址嗎？");
	if (!confirmed) return;

	try {
		const res = await updreciveaddress({
			id: addressId.value,
			reciveTel: uni.getStorageSync("phone"),
			delTag: "1",
		});
		if (res.code === "200") {
			showToast("刪除成功");
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		} else {
			showToast(res.msg || "刪除失敗");
		}
	} catch (error) {
		showToast("刪除失敗");
	}
};

// 保存地址
const handleSave = async () => {
	if (!formData.reciveAddress) {
		showToast("請輸入詳細地址");
		return;
	}

	try {
		const res = await updreciveaddress({
			id: addressId.value,
			reciveAddress: formData.reciveAddress,
			defaultTag: formData.defaultTag,
		});
		if (res.code === "200") {
			showToast("保存成功");
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		} else {
			showToast(res.msg || "保存失敗");
		}
	} catch (error) {
		showToast("保存失敗");
	}
};
</script>

<style scoped lang="scss">
.containers {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
	padding: 30rpx;
}

// 自定義導航欄
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 32rpx;
	background-color: #ffffff;
	padding-top: var(--status-bar-height);
}

.nav-left {
	width: 60rpx;
}

.back-icon {
	font-size: 36rpx;
	color: #333333;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.nav-right {
	width: 60rpx;
	display: flex;
	justify-content: flex-end;
}

.delete-icon {
	width: 40rpx;
	height: 40rpx;
}

.form-wrapper {
	background-color: #ffffff;
	margin-top: 20rpx;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 30rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.form-item-last {
	border-bottom: none;
}

.form-label {
	width: 140rpx;
	font-size: 28rpx;
	color: #333333;
	flex-shrink: 0;
}

.form-text {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.form-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.placeholder-text {
	color: #999999;
}

.phone-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
}

.phone-prefix {
	font-size: 28rpx;
	color: #333333;
}

.phone-divider {
	margin: 0 20rpx;
	color: #e0e0e0;
}

.region-select {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.region-text {
	font-size: 28rpx;
	color: #333333;
}

.arrow-icon {
	font-size: 28rpx;
	color: #999999;
}

.save-btn-wrapper {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	background-color: #ffffff;
}

.save-btn {
	width: 100%;
	height: 88rpx;
	background-color: #52ae7b;
	border-radius: 44rpx;
	font-size: 32rpx;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}
</style>
