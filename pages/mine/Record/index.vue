<template>
	<view class="tab-bar">
		<view
			v-for="(tab, index) in tabList"
			:key="index"
			:class="['tab-item', currentTab === index ? 'active' : '']"
			@click="switchTab(index)"
		>
			{{ tab.name }}
		</view>
	</view>
	<view class="container">
		<!-- 訂單列表 -->
		<scroll-view class="order-list" scroll-y>
			<view v-if="filteredList.length === 0" class="empty-box">
				<text class="empty-text">暫無訂單</text>
			</view>
			<view v-else class="order-card" v-for="item in filteredList" :key="item.tradeId" @click="godetail(item)">
				<!-- 卡片頭部 -->
				<view class="goods-countdown" v-if="currentTab == 0">
					{{ item.expired ? "订单已失效" : item.countdown + " 后未支付，将自动取消" }}
				</view>

				<view class="card-header">
					<text class="shop-name">
						{{ item.tradeMedicineList?.[0]?.pharmacyName || "未知藥房" }}
					</text>
					<text class="order-status" :style="{ color: getStatusColor(item.tradeStatus) }">
						{{ getStatusText(item.tradeStatus) }}
					</text>
				</view>

				<!-- 商品信息 -->
				<view class="goods-info">
					<view class="goods-images" v-for="kk in item.tradeMedicineList">
						<image class="goods-img" :src="kk.photo || '/static/img/34.png'"></image>
					</view>
					<view class="goods-price">
						<text class="price-text">HK${{ item.tradeFee }}</text>
						<text class="goods-count">共{{ item.tradeMedicineList.length }}件</text>
					</view>
				</view>

				<!-- 操作按鈕 -->
				<view class="card-footer">
					<view v-if="item.tradeStatus === '0'" class="btn-primary" @click="godetail(item)">立即支付</view>
					<view v-if="item.tradeStatus === '3'" class="btn-primary" @click.stop="handleConfirmReceive(item)">
						查看物流
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 時間選擇彈窗 -->
		<DateRangePicker
			v-model:visible="showDatePicker"
			:default-start-date="startDate"
			:default-end-date="endDate"
			@confirm="onDateConfirm"
		/>
	</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onShow, onLoad, onNavigationBarButtonTap, onUnload, onBackPress } from "@dcloudio/uni-app";
import { jumpToNextPage } from "@/utils/jumpTo.js";
import { getexpenditure, updexpenditure } from "@/api/yyf.js";
onBackPress(() => {
	uni.hideLoading(); // 新增：返回时隐藏加载
	uni.reLaunch({
		url: "/pages/mine/mine",
	});
	return true;
});
import DateRangePicker from "./date-range-picker.vue";

// 倒计时
const countdown = ref(""); // 显示用
const expired = ref(false); // 是否超时
let timer = null;
//确认收货
const handleConfirmReceive = (item) => {
	console.log(item);

	uni.navigateTo({
		url: `/pages/mine/Record/logistics?tradeId=${item.tradeId}&reciveUser=${item.reciveUser}&reciveAddress=${item.reciveAddress}&reciveTel=${item.reciveTel}&dispenseTime=${item.dispenseTime}&shippedTime=${item.shippedTime}`,
	});
};
//查看物流

const startGlobalCountdown = () => {
	timer && clearInterval(timer);

	timer = setInterval(async () => {
		const now = Date.now();

		for (const item of orderList.value) {
			const endTime = new Date(item.effectiveStartTime.replace(/-/g, "/")).getTime() + 30 * 60 * 1000;

			const prevDiff = endTime - (now - 1000);
			const currDiff = endTime - now;

			// 更新UI
			item.countdown = formatCountdown(item.effectiveStartTime);
			item.expired = currDiff <= 0;

			// 👇 倒计时刚结束
			if (prevDiff > 0 && currDiff <= 0) {
				console.log("订单到期:", item.tradeId);

				// 🚀 调接口（不关心结果）
				switchTab(5);

				// ❗关键：立刻关闭定时器
				clearInterval(timer);
				timer = null;

				console.log("定时器已关闭");

				// ❗必须 break，否则这一轮还会继续跑
				break;
			}
		}
	}, 1000);
};

const isExpired = (tradeTime) => {
	const createTime = new Date(tradeTime).getTime();
	const now = Date.now();

	return now - createTime > 30 * 60 * 1000; // 超过30分钟返回 true
};
const formatCountdown = (tradeTime) => {
	const endTime = new Date(tradeTime.replace(/-/g, "/")).getTime() + 30 * 60 * 1000;
	const now = Date.now();
	const diff = endTime - now;

	if (diff <= 0) {
		return "已超时";
	}

	const m = Math.floor(diff / 1000 / 60);
	const s = Math.floor((diff / 1000) % 60);

	return `${m}分${s}秒`;
};
const startCountdown = (tradeTime) => {
	const endTime = new Date(tradeTime).getTime() + 30 * 60 * 1000;

	timer && clearInterval(timer);

	timer = setInterval(() => {
		const now = Date.now();
		const diff = endTime - now;

		if (diff <= 0) {
			countdown.value = "已超时";
			expired.value = true;
			clearInterval(timer);
			return;
		}

		// 计算剩余时间
		const minutes = Math.floor(diff / 1000 / 60);
		const seconds = Math.floor((diff / 1000) % 60);

		countdown.value = `${minutes}分${seconds}秒`;
	}, 1000);
};

// 當前選中的Tab
const currentTab = ref(0);

// Tab列表
const tabList = ref([
	{
		name: "待付款",
		status: "0",
	},
	{
		name: "待配藥",
		status: "1",
	},
	{
		name: "待發貨",
		status: "2",
	},
	{
		name: "待收貨",
		status: "3",
	},
	{
		name: "已完成",
		status: "4",
	},
	{
		name: "已取消",
		status: "5",
	},
]);

// 訂單列表
const orderList = ref([]);

// 時間選擇器相關
const showDatePicker = ref(false);
const today = new Date();

const formatDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const startDate = ref(formatDate(today));
const endDate = ref(formatDate(today));

// 根據Tab篩選訂單列表
const filteredList = computed(() => {
	const status = tabList.value[currentTab.value].status;
	return orderList.value.filter((item) => item.tradeStatus === status);
});

// 切換Tab
const switchTab = (index) => {
	currentTab.value = index;
	getList(currentTab.value);
};

// 獲取狀態文本
const getStatusText = (status) => {
	const statusMap = {
		0: "待付款",
		1: "待配藥",
		2: "待發貨",
		3: "待收貨",
		4: "已完成",
		5: "已取消",
	};
	return statusMap[status] || "";
};

// 獲取狀態顏色
const getStatusColor = (status) => {
	const colorMap = {
		0: "#E65C5C",
		1: "#E65C5C",
		2: "#E65C5C",
		3: "#E65C5C",
		4: "#52AE7B",
		5: "#999999",
	};
	return colorMap[status] || "#333333";
};

// 格式化價格
const formatPrice = (fee) => {
	if (!fee) return "0.00";
	return (Number(fee) / 100).toFixed(2);
};

// 獲取訂單列表
const getList = async (state = "") => {
	try {
		const params = {
			userId: uni.getStorageSync("userId"),
			// userId: "456789045",
			startTime: startDate.value,
			endTime: endDate.value,
			tradeStatus: state,
			currentPage: 1,
			pageSize: 500,
		};
		console.log(params);
		const res = await getexpenditure(params);
		console.log(res);
		if (res.code === "200") {
			// orderList.value = (res.data.data || []).map((item) => ({
			// 	...item,
			// 	countdown: formatCountdown(item.effectiveStartTime),
			// 	expired: isExpired(item.effectiveStartTime),
			// }));
			// orderList.value = res.data.data || [];
			orderList.value = (res.data.data || []).map((item) => ({
				...item,
				countdown: formatCountdown(item.effectiveStartTime),
				expired: isExpired(item.effectiveStartTime),
				_handled: false, // 👈 防止重复调用
			}));
			console.log(orderList.value);
		}
	} catch (error) {
		console.log(error);
	}
};

// 打開時間選擇器
const openDatePicker = () => {
	showDatePicker.value = true;
};

// 確認日期選擇
const onDateConfirm = (data) => {
	startDate.value = data.startDate;
	endDate.value = data.endDate;
	getList(currentTab.value);
};

// 取消訂單
const cancelOrder = (item) => {
	uni.showModal({
		title: "提示",
		content: "確定要取消該訂單嗎？",
		success: async (res) => {
			if (res.confirm) {
				try {
					const result = await updexpenditure({
						tradeId: item.tradeId,
						tradeStatus: "5",
					});
					console.log(result.data.code);
					if (result.data.code === "1000") {
						uni.showToast({
							title: "取消成功",
							icon: "success",
						});

						// ✅ 刷新列表（很關鍵）
						getList();
					} else {
						uni.showToast({
							title: result.data.msg || "取消失敗",
							icon: "none",
						});
					}
				} catch (e) {
					console.log(e);
					uni.showToast({
						title: "請求失敗",
						icon: "none",
					});
				}
			}
		},
	});
};

// 立即支付
const payOrder = (item) => {
	jumpToNextPage(`/pages/pay/index?tradeId=${item.tradeId}`);
};

// 確認收貨
const confirmReceive = (item) => {
	console.log(item);
	uni.showModal({
		title: "提示",
		content: "確定已收到貨物嗎？",
		success: async (res) => {
			if (res.confirm) {
				console.log(res);
				try {
					const result = await updexpenditure({
						tradeId: item.tradeId,
						tradeStatus: "4",
					});

					if (result.data.code === "1000") {
						uni.showToast({
							title: "已確認收貨",
							icon: "success",
						});

						// ✅ 刷新列表（很關鍵）
						getList();
					} else {
						uni.showToast({
							title: result.data.msg || "確認失敗",
							icon: "none",
						});
					}
				} catch (e) {
					console.log(e);
					uni.showToast({
						title: "請求失敗",
						icon: "none",
					});
				}
			}
		},
	});
};
// 接收頁面參數
onLoad((options) => {
	if (options.current !== undefined) {
		currentTab.value = Number(options.current);
	}
});
const godetail = (item) => {
	console.log(item);
	const data = encodeURIComponent(JSON.stringify(item));
	if (item.tradeStatus === "0") {
		!item.expired && jumpToNextPage(`/pages/mine/Record/detail?detail=${data}`);
	} else {
		jumpToNextPage(`/pages/mine/Record/detail?detail=${data}`);
	}
};

// 右上角按鈕
onNavigationBarButtonTap((e) => {
	openDatePicker();
});

onShow(async () => {
	await getList();
	startGlobalCountdown();
});
onUnload(() => {
	timer && clearInterval(timer);
});
</script>

<style scoped lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
	padding: 20rpx 32rpx;
}

.tab-bar {
	display: flex;
	background-color: #ffffff;
	padding: 24rpx 32rpx;
	position: sticky;
	top: 0;
	z-index: 10;
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 28rpx;
	color: #333333;
	padding: 12rpx 0;
	position: relative;
}

.tab-item.active {
	color: #52ae7b;
	font-weight: 500;
}

.tab-item.active::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 4rpx;
	background-color: #52ae7b;
	border-radius: 2rpx;
}

.order-list {
	flex: 1;
}

.empty-box {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 400rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.order-card {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.shop-name {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
}

.order-status {
	font-size: 26rpx;
}

.goods-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.goods-images {
	display: flex;
	gap: 16rpx;
}

.goods-img {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	background-color: #f5f5f5;
}

.goods-price {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.price-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.goods-count {
	font-size: 24rpx;
	color: #999999;
	margin-top: 8rpx;
}

.goods-countdown {
	font-weight: bold;
	font-size: 28rpx;
	color: #52ae7b;
	margin-bottom: 28rpx;
}

.card-footer {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 20rpx;
	margin-top: 24rpx;
}

.btn-cancel {
	padding: 16rpx 32rpx;
	border: 1rpx solid #cccccc;
	border-radius: 32rpx;
	font-size: 26rpx;
	color: #666666;
}

.btn-primary {
	padding: 16rpx 32rpx;
	border: 1rpx solid #52ae7b;
	border-radius: 32rpx;
	font-size: 26rpx;
	color: #52ae7b;
}

// 時間選擇器彈窗
.date-picker-mask {
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

.date-picker-content {
	width: 100%;
	background-color: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
}

.date-picker-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.date-picker-cancel {
	font-size: 28rpx;
	color: #999999;
}

.date-picker-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.date-picker-confirm {
	font-size: 28rpx;
	color: #52ae7b;
}

.date-picker-body {
	padding: 40rpx 32rpx;
}

.date-input-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.date-label {
	font-size: 28rpx;
	color: #333333;
}

.date-value {
	font-size: 28rpx;
	color: #52ae7b;
}
</style>
