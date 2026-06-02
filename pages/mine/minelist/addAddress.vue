<template>
	<view class="containers">
		<!-- 表單區域 -->
		<view class="form-wrapper">
			<!-- 收件人 -->
			<view class="form-item">
				<view class="form-label">收件人</view>
				<input disabled  class="form-input" type="text" v-model="formData.reciveUsername" placeholder="請輸入收貨人姓名"
					placeholder-class="placeholder-text" />
			</view>
			<!-- 手機號 -->
			<view class="form-item">
				<view class="form-label">手機號</view>
				<view class="phone-input-wrapper">
					<text class="phone-prefix" @click="openCountryPicker">{{ selectedCountryCode }}</text>
					<text class="phone-divider">|</text>
					<input disabled class="form-input phone-input" type="number" v-model="formData.reciveTel"
						placeholder="請輸入聯繫電話" placeholder-class="placeholder-text" />
				</view>
			</view>
			<!-- 配送地區 -->
			<view class="form-item" @click="openRegionPicker">
				<view class="form-label">配送地區</view>
				<view class="region-select">
					<text :class="['region-text', selectedRegionText ? '' : 'placeholder-text']">
						{{ selectedRegionText || '請選擇地區' }}
					</text>
					<text class="arrow-icon">></text>
				</view>
			</view>
			<!-- 詳細地址 -->
			<view class="form-item form-item-last">
				<view class="form-label">詳細地址</view>
				<input class="form-input" type="text" v-model="formData.reciveAddress" placeholder="請輸入詳細地址"
					placeholder-class="placeholder-text" />
			</view>
			<view class="form-item form-item-last">
				<view class="form-label">设置为默认</view>
				
				<switch 
					style="margin-left: 350rpx;"
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
		<!-- 國家區號選擇彈窗 -->
		<view class="region-popup" v-if="showCountryPopup" @click="closeCountryPopup">
			<view class="region-popup-content" @click.stop>
				<view class="popup-header">
					<text class="popup-title">選擇國家/地區</text>
					<text class="popup-close" @click="closeCountryPopup">×</text>
				</view>
				<scroll-view class="country-list" scroll-y>
					<view v-for="item in countryListData" :key="item.id"
						:class="['country-item', selectedCountry?.id === item.id ? 'active' : '']"
						@click="selectCountry(item)">
						<text class="country-name">{{ item.countryCn }}</text>
						<text class="country-code">{{ item.countryCode }}</text>
					</view>
				</scroll-view>
			</view>
		</view>
		
	</view>
</template>
<script setup>
	import {
		reactive,
		ref,
		computed,
		onMounted
	} from "vue";
	import {
		showToast,
		showModal
	} from "@/utils/feedback.js";
	import {
		jumpToNextPage
	} from "@/utils/jumpTo";
	import {
		onShow
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		addreciveaddress,
		countryList,
		getuser
	} from "@/api/yyf.js"
	
	onShow(() => {
		setNavigationBar("新增地址","#ffffff");
		userxinxi();
		// 從緩存獲取選中的地區數據
		const regionData = uni.getStorageSync('selectedRegionData');
		if (regionData) {
			selectedCountryRegion.value = regionData.country;
			selectedProvince.value = regionData.province;
			selectedCity.value = regionData.city;
			selectedDistrict.value = regionData.district;
			formData.regionCode = regionData.regionCode;
			formData.reciveRegion = regionData.reciveRegion;
			// 清除緩存
			uni.removeStorageSync('selectedRegionData');
		}
	});
	
	// 表單數據
	const formData = reactive({
		reciveUsername: "",
		reciveTel: "",
		reciveRegion: "",
		reciveAddress: "",
		defaultTag: "0",
		regionCode: "",
		delTag: "0"
	});

	// 國家區號選擇相關（用於手機號前綴）
	const showCountryPopup = ref(false);
	const countryListData = ref([]);
	const selectedCountry = ref(null);
	const selectedCountryCode = computed(() => {
		return selectedCountry.value?.countryCode || '+86';
	});

	// 地區選擇相關
	const selectedCountryRegion = ref(null);
	const selectedProvince = ref(null);
	const selectedCity = ref(null);
	const selectedDistrict = ref(null);

	// 選中的地區文本
	const selectedRegionText = computed(() => {
		if (selectedCountryRegion.value && selectedProvince.value && selectedCity.value && selectedDistrict.value) {
			return `${selectedCountryRegion.value.region.regionName} ${selectedProvince.value.region.regionName} ${selectedCity.value.region.regionName} ${selectedDistrict.value.region.regionName}`;
		}
		return "";
	});

	// 頁面加載時獲取國家列表並默認選中中國大陸
	onMounted(async () => {
		await getCountryList();
	});

	// 獲取國家列表（用於手機號區號）
	const getCountryList = async () => {
		try {
			const res = await countryList({});
			if (res.code === "200") {
				countryListData.value = res.data.data || [];
				const china = countryListData.value.find(item => item.countryCode === '+86');
				if (china) {
					selectedCountry.value = china;
				}
			}
		} catch (error) {
			showToast("獲取國家列表失敗");
		}
	};

	// 打開國家區號選擇彈窗（手機號）
	const openCountryPicker = async () => {
		if (countryListData.value.length === 0) {
			await getCountryList();
		}
		showCountryPopup.value = true;
	};

	// 關閉國家區號選擇彈窗
	const closeCountryPopup = () => {
		showCountryPopup.value = false;
	};

	// 選擇國家（手機號區號）
	const selectCountry = (item) => {
		selectedCountry.value = item;
		showCountryPopup.value = false;
	};

	// 打開地區選擇頁面
	const openRegionPicker = () => {
		uni.navigateTo({
			url: '/pages/mine/minelist/Selectregion'
		});
	};

	// 保存地址
	const handleSave = async () => {
		if (!formData.reciveUsername) {
			showToast("請輸入收件人姓名");
			return;
		}
		if (!formData.reciveTel) {
			showToast("請輸入手機號");
			return;
		}
		if (!selectedCountryRegion.value) {
			showToast("請選擇配送地區");
			return;
		}
		if (!formData.reciveAddress) {
			showToast("請輸入詳細地址");
			return;
		}

		try {
			const fullAddress =
				(selectedCountryRegion.value?.region?.regionName || "") +
				(selectedProvince.value?.region?.regionName || "") +
				(selectedCity.value?.region?.regionName || "") +
				(selectedDistrict.value?.region?.regionName || "") +
				formData.reciveAddress;
			
			const res = await addreciveaddress({
				reciveUsername: formData.reciveUsername,
				reciveTel: formData.reciveTel,
				reciveRegion: formData.reciveRegion,
				reciveAddress: fullAddress,
				defaultTag: formData.defaultTag,
				regionCode: formData.regionCode,
				delTag: formData.delTag
			});
			console.log( formData.defaultTag);
			if (res.code === "200") {
				console.log(res);
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
	const handleSwitchChange = (e) => {
		formData.defaultTag = e.detail.value ? "1" : "0";
	};
	const userxinxi = async () => {
		const res = await getuser({
			serialNumber: uni.getStorageSync("phone"),
		});
	
		if (res.code == "200") {
			formData.reciveUsername = res.data.data.userName;
			formData.reciveTel = res.data.data.serialNumber;
		}
	}
</script>

<style scoped lang="scss">
	.containers {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		padding: 30rpx;
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

	.phone-input {
		flex: 1;
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
		background-color: #52AE7B;
		border-radius: 44rpx;
		font-size: 32rpx;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
	}

	.region-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}

	.region-popup-content {
		width: 100%;
		background-color: #ffffff;
		border-radius: 24rpx 24rpx 0 0;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.popup-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
	}

	.popup-close {
		font-size: 40rpx;
		color: #999999;
	}

	.country-list {
		height: 500rpx;
	}

	.country-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&.active {
			background-color: #f0f9f0;
		}

		&:last-child {
			border-bottom: none;
		}
	}

	.country-name {
		font-size: 28rpx;
		color: #333333;
	}

	.country-code {
		font-size: 28rpx;
		color: #52AE7B;
	}
</style>