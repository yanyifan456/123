<template>
	<view class="container">
		<!-- 已選擇提示 -->
		<view class="selected-header">
			<text class="selected-label">已选择：</text>
			<text class="selected-text">{{ selectedText }}</text>
		</view>

		<!-- 四列地區選擇 -->
		<view class="region-columns">
			<!-- 國家列 -->
			<scroll-view class="region-column" style="background-color: rgba(162, 162, 162, 0.24);" scroll-y>
				<view v-for="item in countryList" :key="item.region.regionCode"
					:class="['region-item', selectedCountry?.region?.regionCode === item.region.regionCode ? 'active' : '']"
					@click="selectCountry(item)">
					<text class="region-name">{{ item.region.regionName }}</text>
				</view>
			</scroll-view>

			<!-- 省份列 -->
			<scroll-view class="region-column" style="background-color: rgba(216, 216, 216, 0.3);" scroll-y>
				<view v-for="item in provinceList" :key="item.region.regionCode"
					:class="['region-item', selectedProvince?.region?.regionCode === item.region.regionCode ? 'active' : '']"
					@click="selectProvince(item)">
					<text class="region-name">{{ item.region.regionName }}</text>
				</view>
			</scroll-view>

			<!-- 城市列 -->
			<scroll-view class="region-column" style="background-color: #F8F8F8;" scroll-y>
				<view v-for="item in cityList" :key="item.region.regionCode"
					:class="['region-item', selectedCity?.region?.regionCode === item.region.regionCode ? 'active' : '']"
					@click="selectCity(item)">
					<text class="region-name">{{ item.region.regionName }}</text>
				</view>
			</scroll-view>

			<!-- 區縣列 -->
			<scroll-view class="region-column" style="background-color: #FFFFFF;" scroll-y>
				<view v-for="item in districtList" :key="item.region.regionCode"
					:class="['region-item', selectedDistrict?.region?.regionCode === item.region.regionCode ? 'active' : '']"
					@click="selectDistrict(item)">
					<text class="region-name">{{ item.region.regionName }}</text>
				</view>
			</scroll-view>
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
		onLoad,
		onNavigationBarButtonTap
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		getregiontree,
	} from "@/api/yyf.js"

	onLoad(() => {
		setNavigationBar("选择地区");
		loadRegionData();
	});

	// 地區樹數據
	const regionTreeData = ref(null);

	// 各級列表
	const countryList = ref([]);
	const provinceList = ref([]);
	const cityList = ref([]);
	const districtList = ref([]);

	// 選中項
	const selectedCountry = ref(null);
	const selectedProvince = ref(null);
	const selectedCity = ref(null);
	const selectedDistrict = ref(null);

	// 已選擇文本
	const selectedText = computed(() => {
		const parts = [];
		if (selectedCountry.value) parts.push(selectedCountry.value.region.regionName);
		if (selectedProvince.value) parts.push(selectedProvince.value.region.regionName);
		if (selectedCity.value) parts.push(selectedCity.value.region.regionName);
		if (selectedDistrict.value) parts.push(selectedDistrict.value.region.regionName);
		return parts.join('  ') || '请选择地区';
	});

	// 加載地區數據
	const loadRegionData = async () => {
		try {
			const res = await getregiontree();
			if (res.code === "200") {
				regionTreeData.value = res.data;
				const rootData = res.data.data;
				if (rootData.region) {
					// 單個國家節點，包裝成數組
					countryList.value = [rootData];
				} else if (Array.isArray(rootData)) {
					countryList.value = rootData;
				} else if (rootData.children) {
					countryList.value = rootData.children;
				}
			}
		} catch (error) {
			showToast("獲取地區數據失敗");
		}
	};

	// 選擇國家
	const selectCountry = (item) => {
		selectedCountry.value = item;
		selectedProvince.value = null;
		selectedCity.value = null;
		selectedDistrict.value = null;

		provinceList.value = item.children || [];
		cityList.value = [];
		districtList.value = [];
	};

	// 選擇省份
	const selectProvince = (item) => {
		selectedProvince.value = item;
		selectedCity.value = null;
		selectedDistrict.value = null;

		cityList.value = item.children || [];
		districtList.value = [];
	};

	// 選擇城市
	const selectCity = (item) => {
		selectedCity.value = item;
		selectedDistrict.value = null;

		districtList.value = item.children || [];
	};

	// 選擇區縣
	const selectDistrict = (item) => {
		selectedDistrict.value = item;

		// 選擇完成，保存數據並返回
		confirmSelection();
	};

	// 確認選擇
	const confirmSelection = () => {
		if (!selectedCountry.value) {
			showToast("请选择国家");
			return;
		}

		// 根據選擇的層級設置reciveRegion
		let reciveRegion = '';
		if (selectedDistrict.value) {
			reciveRegion = selectedDistrict.value.region.regionCode;
		} else if (selectedCity.value) {
			reciveRegion = selectedCity.value.region.regionCode;
		} else if (selectedProvince.value) {
			reciveRegion = selectedProvince.value.region.regionCode;
		} else {
			reciveRegion = selectedCountry.value.region.regionCode;
		}

		// 保存選中的數據到緩存
		uni.setStorageSync('selectedRegionData', {
			country: selectedCountry.value,
			province: selectedProvince.value,
			city: selectedCity.value,
			district: selectedDistrict.value,
			regionCode: selectedCountry.value.region.regionCode,
			reciveRegion: reciveRegion
		});

		// 返回上一頁
		uni.navigateBack();
	};
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background-color: #ffffff;
		display: flex;
		flex-direction: column;
	}

	.selected-header {
		display: flex;
		align-items: center;
		padding: 24rpx 32rpx;
		background-color: #f8f8f8;
		border-bottom: 1rpx solid #eeeeee;
	}

	.selected-label {
		font-size: 26rpx;
		color: #666666;
	}

	.selected-text {
		font-size: 26rpx;
		color: #333333;
		margin-left: 8rpx;
	}

	.region-columns {
		flex: 1;
		display: flex;
		flex-direction: row;
	}

	.region-column {
		flex: 1;
		height: calc(100vh - 100rpx);
		border-right: 1rpx solid #f0f0f0;

		&:last-child {
			border-right: none;
		}
	}

	.region-item {
		padding: 28rpx 20rpx;
	}

	.region-item.active {
		background-color: #FFFFFF;
	}

	.region-item.active .region-name {
		color: #52AE7B;
		font-weight: bold;
	}

	.region-name {
		font-size: 26rpx;
		color: #333333;
		line-height: 1.4;
	}
</style>