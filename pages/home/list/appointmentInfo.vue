<template>
	<view class="page">
		<view class="top-box">
			<up-tabs
				:activeStyle="{ color: '#459767' }"
				lineColor="#459767"
				:current="tabsCurrent"
				:list="tabList"
				@change="changeTabs"
			></up-tabs>
		</view>
		<scroll-view
			scroll-y="true"
			class="scroll-box"
			lower-threshold="80"
			ref="scrollRef"
			:key="tabsCurrent"
			@scrolltolower="handleLoadMore"
		>
			<view v-for="item in tabData[tabsCurrent].list" class="order-card">
				<view>
					<view>订单号：{{ item.orderId }}</view>
					<view :style="{ color: statusColorMap[item.orderState] }">{{ statusMap[item.orderState] }}</view>
				</view>
				<view></view>
				<view>
					<view>
						<image class="img-box img-circle" :src="item.avatar" mode=""></image>
					</view>
					<view>
						<view>
							<view>{{ item.doctorName }}</view>
							<view>{{ item.departName }}</view>
						</view>
						<view>{{ item.hospital }}</view>
					</view>
				</view>
				<view>
					<view>
						<view>就诊人</view>
						<view>{{ item.orderUserName }}</view>
					</view>
					<view>
						<view>预约时间</view>
						<view>{{ item.orderTime }}</view>
					</view>
					<view>
						<view>会诊费用</view>
						<view>￥{{ item.orderFee }}</view>
					</view>
					<view>
						<view>支付类型</view>
						<view>{{ item.payType }}</view>
					</view>
				</view>

				<view class="actions" v-if="item.orderState != 7">
					<view
						class="action-btn"
						v-for="(btn, idx) in buttonMap[item.orderState]"
						:style="{
							border: '1px solid ' + btn.borderColor,
							color: btn.color,
						}"
						@click="handleAction(btn.action, item)"
					>
						{{ btn.text }}
					</view>
				</view>
				<view v-else class="edit-record-btn" @click="handleAction(buttonMap[item.orderState][0].action, item)">
					<view class="">审核不通过请修改病历后重新上传</view>
					<view class="">
						{{ "去修改 >" }}
					</view>
				</view>
			</view>
			<!-- loading -->
			<view class="loading-box" v-if="tabData[tabsCurrent].loading">
				<uni-icons color="#a2a2a2" type="spinner-cycle" size="30"></uni-icons>
			</view>

			<!-- 已到底 -->
			<view class="loading-finish" v-if="!tabData[tabsCurrent].hasMore">我是有底线的</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive, nextTick } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { cancelOrderNotPay, cancelOrderPay, selectUserOrderList, createPayOrder, AliPay } from "@/api/base.js";
const userPhone = ref("");
onLoad((options) => {
	console.log(options);
	if (options.tabsCurrent) {
		tabsCurrent.value = Number(options.tabsCurrent);
	}
	// loadCards();
	userPhone.value = uni.getStorageSync("phone") || "";
	if (!userPhone.value) {
		uni.showToast({
			title: "请先登录",
			icon: "none",
		});
		return;
	}
});

onShow(() => {
	resetCurrentTabData();
	loadCards();
});

const tabsCurrent = ref(0);
const tabToOrderState = {
	0: "", // 全部
	1: "6", // 待审核
	2: "0", // 待支付
	3: "1", // 待会诊
	4: "4", // 取消预约
	5: "3", // 已完成
};
const tabList = reactive([
	{
		name: "全部",
	},
	{
		name: "待审核",
	},
	{
		name: "待支付",
	},
	{
		name: "待會診",
	},
	{
		name: "取消預約",
	},
	{
		name: "已完成",
	},
]);
// 每个 tab 独立维护分页状态
const tabData = reactive([
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 全部
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 待审核
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 待支付
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 待会诊
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 取消预约
	{
		list: [],
		page: 1,
		hasMore: true,
		loading: false,
		total: 0,
	}, // 已完成
]);

const scrollRef = ref(null);
// 切换 tab
const changeTabs = ({ index }) => {
	tabsCurrent.value = index;
	// 每次切换都重置并重新加载
	resetTabData(index);
	loadCards();
};
const resetTabData = (index) => {
	const current = tabData[index];
	current.list = [];
	current.page = 1;
	current.total = 0;
	current.hasMore = true;
	current.loading = false;
};
const pageSize = 10;

const statusMap = {
	0: "待支付",
	1: "待會診",
	2: "待評價",
	3: "已完成",
	4: "取消預約",
	5: "医生取消预约",
	6: "待审核",
	7: "审核不通过",
};

const statusColorMap = {
	0: "#459767", // 待支付
	1: "#3574cc", // 待会诊
	2: "#ff5500", // 待评价
	3: "#979698", // 已完成
	4: "#ff6a6a", // 取消预约
	5: "#ff6a6a", // 取消预约
};
const buttonMap = {
	0: [
		{
			text: "取消訂單",
			color: "#ff6a6a",
			borderColor: "#ff6a6a",
			action: "cancel",
		},
		{
			text: "立即支付",
			color: "#459767",
			borderColor: "#459767",
			action: "pay",
		},
	],
	1: [
		// {
		// 	text: "上傳病歷",
		// 	color: "#3574cc",
		// 	borderColor: "#3574cc",
		// 	action: "upload",
		// },
		{
			text: "取消訂單",
			color: "#ff6a6a",
			borderColor: "#ff6a6a",
			action: "cancel",
		},
		// {
		// 	text: "問診",
		// 	color: "#459767",
		// 	borderColor: "#459767",
		// 	action: "video",
		// },
	],
	2: [
		{
			text: "評價",
			color: "#ff5500",
			borderColor: "#ff5500",
			action: "review",
		},
	],
	3: [
		{
			text: "再次預約",
			color: "#5d8573",
			borderColor: "#5d8573",
			action: "rebook",
		},
	],
	4: [], // 取消预约没有按钮
	6: [
		{
			text: "上傳病歷",
			color: "#3574cc",
			borderColor: "#3574cc",
			action: "upload",
		},
	],
	7: [
		{
			text: "编辑病历",
			color: "#ff5500",
			borderColor: "#ff5500",
			action: "editRecord",
		},
	],
};
const actions = {
	cancel: (item) => {
		if (item.orderState == 0) {
			console.log("取消訂單未支付", item);
			cancelOrderNo(item.scheduleId, item.orderId, "4");
		} else {
			console.log("已支付");
			cancelOrderNo(item.scheduleId, item.orderId, "4");
		}
	},
	pay: async (item) => {
		return;
		var EnvUtils = plus.android.importClass("com.alipay.sdk.app.EnvUtils");
		EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
		const res = await AliPay({ orderNo: item.orderId, payFee: item.orderFee });
		if (res.code == 200) {
			const payData = res.data;
			uni.requestPayment({
				provider: "alipay",
				orderInfo: payData, // 后端返回的 orderString

				success: async (payRes) => {
					console.log("支付回调:", payRes);

					uni.showLoading({
						title: "处理中...",
					});

					try {
						const params = {
							orderState: 1,
							orderId: item.orderId,
							scheduleId: item.scheduleId,
							outChargeId: payRes.tradeno,
							orderUserId: item.orderUserId,
							orderFee: item.orderFee,
						};
						const orderRes = await cancelOrderNotPay(params);
						uni.hideLoading();

						uni.showToast({
							title: "支付成功",
							icon: "success",
						});
						uni.switchTab({
							url: "/pages/home/home",
						});
						console.log("订单创建成功:", orderRes);
					} catch (error) {
						uni.hideLoading();

						console.error("订单创建失败:", error);

						uni.showToast({
							title: "支付失败",
							icon: "none",
						});
					}
				},

				fail: (err) => {
					console.log("支付失败", err);

					// 用户取消支付要单独判断
					if (err.errMsg.includes("cancel")) {
						uni.showToast({
							title: "已取消支付",
							icon: "none",
						});
					} else {
						uni.showToast({
							title: "支付失败",
							icon: "none",
						});
					}
				},
			});
		}
	},
	editRecord: (item) => {
		const val = {
			historyCase: item.historyCase,
			historyDiagnosis: item.historyDiagnosis,
			historyReport: item.historyReport,
			casePhoto: item.casePhoto, // 病例图片
			diagnosisPhoto: item.diagnosisPhoto, // 诊断图片
			reportPhoto: item.reportPhoto, // 检查报告图片
			orderId: item.orderId, // 订单ID
			orderUserId: item.orderUserId, // 订单用户ID
			checkResult: item.checkResult,
		};
		uni.setStorageSync("medicalRecord", val);
		uni.navigateTo({
			url: `/pages/mine/minelist/recordDetail?type=${"edit"}&orderId=${item.orderId}&orderUserId=${
				item.orderUserId
			}`,
		});
	},
	upload: (item) => {
		// return;
		if (!item.casePhoto) {
			uni.navigateTo({
				url: `/pages/mine/minelist/recordDetail?type=${"add"}&orderId=${item.orderId}&orderUserId=${
					item.orderUserId
				}`,
			});
		} else {
			uni.showToast({
				icon: "none",
				title: "病历已经上传，正在审核，请耐心等待结果",
				mask: true,
			});
		}
	},
	video: (item) => console.log("視訊會診", item.orderId),
	review: (item) => {
		uni.showToast({
			title: "正在開發",
			icon: "none",
		});
	},
	rebook: (item) => {
		console.log("再次預約", item);
		return;
		const params = {
			orderUserId: item.orderUserId,
			doctorId: item.doctorId,
			doctorSkill: item.doctorSkill,
			orderFee: item.orderFee,
			// countryCode: "",
		};
		createOrder(params);
	},
};
const createOrder = async (params) => {
	try {
		const res = await createPayOrder(params);
		console.log(res);
		if (res.code == 200) {
			uni.showToast({
				title: res.data.message,
			});
			tabsCurrent.value = 0;
			resetTabData(0);
			loadCards();
		}
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
	}
};
const handleAction = (actionKey, item) => {
	if (actions[actionKey]) actions[actionKey](item);
};

const handleLoadMore = () => {
	const current = tabData[tabsCurrent.value];

	if (current.page === 1) return;
	if (current.loading || !current.hasMore) return;

	loadCards();
};

const loadCards = async () => {
	const currentTab = tabData[tabsCurrent.value];
	if (currentTab.loading || !currentTab.hasMore) return;

	currentTab.loading = true;

	try {
		const params = {
			tradeType: "0",
			orderUserId: uni.getStorageSync("userId"),
			orderState: tabToOrderState[tabsCurrent.value],
			currentPage: currentTab.page,
			pageSize: pageSize,
		};
		console.log(params);
		const res = await selectUserOrderList(params);
		console.log(res);
		if (res?.code == 200) {
			const newData = res.data?.data || [];
			const total = res.data?.total || 0;

			currentTab.total = total;

			const mappedData = newData.map((item) => ({
				...item,
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				payType: "支付宝",
				hospital: "環球港醫網",
			}));
			currentTab.list.push(...mappedData);
			// 🔥 核心判断
			if (currentTab.list.length < currentTab.total) {
				currentTab.page++;
			} else {
				currentTab.hasMore = false;
			}
		}
	} catch (e) {
		console.log(e);
	} finally {
		currentTab.loading = false;
	}
};
// 重置当前 tab 的数据
const resetCurrentTabData = () => {
	const current = tabData[tabsCurrent.value];
	current.list = [];
	current.page = 1;
	current.total = 0;
	current.hasMore = true;
	current.loading = false;
};
// 取消订单（未支付）
const cancelOrderNo = async (scheduleId, orderId, status) => {
	try {
		const params = {
			scheduleId: scheduleId,
			orderId: orderId,
			orderState: status,
		};
		const res = await cancelOrderNotPay(params);
		if (res.code == 200) {
			resetCurrentTabData();
			loadCards();
		}
	} catch (error) {
		//TODO handle the exception
	}
};
// 取消订单（支付）
const cancelOrderYes = async (scheduleId, orderId, status) => {
	try {
		const params = {
			scheduleId: scheduleId,
			orderId: orderId,
			orderState: status,
		};
		const res = await cancelOrderPay(params);

		if (res.code == 200) {
			resetCurrentTabData();
			loadCards();
		}
	} catch (error) {
		//TODO handle the exception
	}
};
</script>
<style scoped lang="scss">
.top-box {
	position: sticky;
	top: 0;
	left: 0;
	background-color: $bg-page;
	padding: 0 $space-48;
	z-index: 99;
}

.scroll-box {
	height: 100%;
	padding: 0 $space-48 $space-32;
	box-sizing: border-box;
}

.order-card {
	width: 100%;
	height: fit-content;
	background-color: #fff;
	box-shadow: $box-shadow;
	border-radius: $space-20;
	padding: $space-32;
	margin-top: $space-24;

	> :nth-child(1) {
		color: $text-primary;
		font-size: $font-26;
		@include flex-between;

		> :nth-child(2) {
			color: $primary;
		}
	}

	> :nth-child(2) {
		margin-top: $space-20;
		width: 100%;
		height: 2rpx;
		background-color: $text-secondary;
	}

	> :nth-child(3) {
		margin-top: $space-8;
		width: 100%;
		@include flex-start;

		> :nth-child(1) {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			margin-right: $space-32;
		}

		> :nth-child(2) {
			flex: 1;

			> :nth-child(1) {
				@include flex-start;

				> :nth-child(1) {
					margin-right: $space-16;
					color: $text-primary;
					font-size: $font-32;
				}

				> :nth-child(2) {
					margin-right: $space-16;
					color: $text-regular;
					font-size: $font-24;
				}
			}

			> :nth-child(2) {
				margin-top: $space-20;
				color: $text-secondary;
				font-size: $font-24;
			}
		}
	}

	> :nth-child(4) {
		width: 100%;
		height: 234rpx;
		background: $bg-page;
		box-shadow: $box-shadow;
		border-radius: $space-20;
		padding: 0 $space-32;
		margin-top: $space-24;

		> view {
			height: 56rpx;
			padding: $space-16 0;
			font-size: $font-24;
			@include flex-between;

			> :nth-child(2) {
				color: $text-secondary;
			}
		}
	}
}

.loading-box {
	margin-top: $space-12;
	@include flex-center;
}

.loading-finish {
	width: 100%;
	height: 160rpx;
	padding: $space-20 $space-48;
	color: $text-secondary;
	@include flex-center;
}

.actions {
	display: grid;
	grid-auto-flow: column;
	grid-gap: 24rpx;
	justify-content: end;
	margin-top: 24rpx;

	.action-btn {
		width: 160rpx;
		height: 56rpx;
		border-radius: 28rpx;
		font-size: 26rpx;
		@include flex-center;
	}
}

.edit-record-btn {
	margin-top: 24rpx;
	border-radius: 20rpx;
	height: fit-content;
	width: 100%;
	background-color: rgba($danger, 0.1);
	font-size: 24rpx;
	color: $text-regular;
	padding: 16rpx 32rpx;
	@include flex-between;

	> :nth-child(1) {
		margin-right: 32rpx;
	}

	> :nth-child(2) {
		color: $danger;
	}
}
</style>
