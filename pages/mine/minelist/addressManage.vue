<template>
	<view class="containers ">
		<!-- 內容區域 -->
		<view class="content">
			<!-- 地址列表 -->
			<view class="address-item" v-for="(item, index) in addressList" :key="item.id" @click="selectAddress(item)">

				<view class="address-content">
					<view class="address-detail">
						{{ item.reciveAddress }}
					</view>
					<view style="display: flex;justify-content: space-between;">
						<view class="address-info">
							<text class="name">{{ item.reciveUsername }}</text>
							<text class="phone">{{ item.reciveTel }}</text>
						</view>
						<view class="pppaa" v-if="item.defaultTag==='1'">
							<text style="font-size: 20rpx;color: #52AE7B;"> 默认</text>
						</view>
					</view>
				</view>

				<view class="edit-icon" @click.stop="editAddress(item)">
					<image class="edit-img" src="/static/img/18.png" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<!-- 固定在底部的新增地址按鈕 -->
		<view class="footer-btn">
			<view class="add-btn" @click="addAddress">+ 新增地址</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		showToast,
		showModal
	} from "@/utils/feedback.js";
	import {
		jumpToNextPage
	} from "@/utils/jumpTo";
	import {
		onShow,
		onLoad
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		getreciveaddress
	} from "@/api/yyf.js"
	const fromPage = ref('');

	onLoad((options) => {
		fromPage.value = options.from || '';
	});
	// 地址列表數據
	const addressList = ref([]);

	onShow(() => {
		setNavigationBar("地址管理","#ffffff");
		getlist();
	});

	// 獲取地址列表
	const getlist = async () => {
		const res = await getreciveaddress({
			reciveTel: uni.getStorageSync("phone")
		});
		console.log(res);
		if (res.code === "200") {
			addressList.value = res.data.data || [];
		}
	};

	// 選擇地址並返回上一頁
	const selectAddress = (item) => {
		console.log(item);
		uni.setStorageSync('selectedAddress', item);

		if (fromPage.value === 'recordDetail') {
			uni.navigateBack();
		}
	};

	// 編輯地址
	const editAddress = (item) => {
		console.log(item);
		const params =
			`id=${item.id}&reciveUsername=${encodeURIComponent(item.reciveUsername)}&reciveTel=${item.reciveTel}&reciveAddress=${encodeURIComponent(item.reciveAddress)}&reciveRegion=${item.reciveRegion}&regionCode=${item.regionCode}&defaultTag=${item.defaultTag}`;
		jumpToNextPage(`/pages/mine/minelist/bj?${params}`);
	};

	// 新增地址
	const addAddress = () => {
		jumpToNextPage("/pages/mine/minelist/addAddress");
	};
	const toggleSelect = (index) => {
		const current = addressList.value[index]

		// 已選中 → 取消
		if (current.defaultTag === '1') {
			current.defaultTag = '0'
			return
		}

		// 只允許選中一個
		addressList.value.forEach((item, i) => {
			item.defaultTag = i === index ? '1' : '0'
		})
	}
</script>

<style scoped lang="scss">
	.content {
		padding: 0;
		width: 100%;
		min-height: calc(100vh - 140rpx);
		background-color: #f5f5f5;
		box-sizing: border-box;
		overflow: auto;
		padding: 30rpx;
	}

	// 地址卡片
	.address-item {
		display: flex;
		align-items: flex-start;
		background-color: #ffffff;
		padding: 32rpx;
		border-bottom: 1rpx solid #D8D8D8;


	}

	// 選擇圖標
	.select-icon {
		margin-right: 24rpx;
		padding-top: 8rpx;
	}

	.selected-circle {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: #52AE7B;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		color: #ffffff;
		font-size: 24rpx;
		font-weight: bold;
	}

	.unselected-circle {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 2rpx solid #cccccc;
		box-sizing: border-box;
	}

	// 地址內容
	.address-content {
		flex: 1;
	}

	.address-detail {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
		margin-bottom: 16rpx;
	}

	.address-info {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 26rpx;
		color: #999999;
		margin-right: 24rpx;
	}

	.phone {
		font-size: 26rpx;
		color: #999999;
	}

	// 編輯圖標
	.edit-icon {
		padding: 8rpx;
		margin-left: 20rpx;
	}

	.edit-img {
		width: 32rpx;
		height: 32rpx;
	}

	// 底部按鈕容器
	.footer-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 32rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #fff;
	}

	// 新增按鈕
	.add-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		font-size: 30rpx;
		color: #fff;
		background: #52AE7B;
		border-radius: 44rpx;
	}

	.edit-icon.disabled {
		opacity: 0.4;
	}

	.pppaa {
		width: 68rpx;
		height: 36rpx;
		background: rgba(82, 174, 123, 0.42);
		border-radius: 18rpx 18rpx 18rpx 18rpx;
		text-align: center;
		line-height: 30rpx;
	}
</style>