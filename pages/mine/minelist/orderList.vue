<!-- 會診訂單 -->
<template>
	<view class="box">
		<view class="tabs-box">
			<up-tabs :activeStyle="{ color: '#459767' }" lineColor="#459767" :current="tabsCurrent" :list="tabList"
				@change="changeTabs"></up-tabs>
		</view>
		<view class="content">
			<!-- 顶部 Tabs -->

			<!-- 空数据提示 -->
			<up-empty v-if="tabData[tabsCurrent].list.length === 0 && !tabData[tabsCurrent].loading" mode="order"
				icon="http://cdn.uviewui.com/uview/empty/car.png" text="暫無數據" marginTop="200rpx"></up-empty>

			<!-- 卡片列表 -->
			<view v-for="(item, index) in tabData[tabsCurrent].list" :key="index" class="content-card box-mt-24">
				<view class="card-title">
					<text class="fs-26 color-373738">訂單號：{{ item.orderId }}</text>
					<text class="fs-26" :style="{ color: statusColorMap[item.status] }">
						{{ statusMap[item.status] }}
					</text>
				</view>
				<up-divider></up-divider>
				<view class="doctor-info">
					<up-avatar class="box-mr-32" :src="item.avatar"></up-avatar>
					<view>
						<view>
							<text style="font-size: 32rpx;margin-right: 16rpx;color: #181B19;">
								{{ item.doctorName }}
							</text>
							<text style="font-size: 24rpx;color: #434343;">
								{{ item.department }}
							</text>
						</view>
						<view>
							<text style="font-size: 20rpx;color: #434343;margin-right: 16rpx;">
								{{ item.hospital }}
							</text>
							<text style="font-size: 20rpx;color: #434343;margin-right: 16rpx;">丨</text>
							<text style="font-size: 20rpx;color: #434343;margin-right: 16rpx;">
								{{ item.specialty }}
							</text>
						</view>
					</view>
				</view>
				<view class="reocrd-info box-mt-24">
					<up-cell :border="false">
						<template #title>
							<text style="color: #181B19;font-size: 24rpx;">就診人</text>
						</template>
						<template #value>
							<text style="font-size: 24rpx;color: #A2A2A2;">
								{{ item.patient }}
							</text>
						</template>
					</up-cell>
					<up-cell :border="false">
						<template #title>
							<text style="color: #181B19;font-size:24rpx;">預約時間</text>
						</template>
						<template #value>
							<text style="font-size: 24rpx;color: #A2A2A2;">
								{{ item.time }}
							</text>
						</template>
					</up-cell>
					<up-cell :border="false">
						<template #title>
							<text style="color: #181B19;font-size: 24rpx;">會診費用</text>
						</template>
						<template #value>
							<text style="font-size: 24rpx;color: #A2A2A2;">￥{{ item.money }}</text>
						</template>
					</up-cell>
					<up-cell :border="false">
						<template #title>
							<text style="color: #181B19;font-size: 24rpx;">支付類型</text>
						</template>
						<template #value>
							<text style="font-size: 24rpx;color: #A2A2A2;">
								{{ item.payType }}
							</text>
						</template>
					</up-cell>
				</view>
				<view class="actions box-mt-24">
					<u-button v-for="(btn, idx) in buttonMap[item.status]" :key="idx" class="action-btn fs-26" :style="{
							border: '1px solid ' + btn.borderColor,
							color: btn.color,
						}" @click="handleAction(btn.action, item)">
						{{ btn.text }}
					</u-button>
				</view>
			</view>
			<!-- 底部加载提示 -->
			<view class="status-box" v-if="tabData[tabsCurrent].list.length > 0 || tabData[tabsCurrent].loading">
				<view v-if="tabData[tabsCurrent].loading" class="loading">
					<up-loading-icon size="20" mode="circle"></up-loading-icon>
					<text class="ml-12">正在加載...</text>
				</view>
				<view v-else-if="!tabData[tabsCurrent].hasMore" class="no-more">沒有更多了</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from "vue";
	import {
		onReachBottom,
		onShow,
		onLoad
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		jumpToNextPage
	} from "@/utils/jumpTo.js";
	import {
		showToast
	} from "@/utils/feedback.js";
	import {
		t
	} from "@/utils/i18n.js";

	onShow(() => {
		setNavigationBar("會診訂單");
	});

	// tabs页签
	const tabsCurrent = ref(0);
	const tabList = reactive([{
		name: "待支付"
	}, {
		name: "待會診"
	}, {
		name: "待評價"
	}]);
	onLoad(({
		current
	}) => {
		console.log(JSON.parse(current));
		// return;
		tabsCurrent.value = JSON.parse(current) || 0;
		if (tabData[tabsCurrent.value].list.length === 0) {
			loadCards();
		}
	});
	// 每个 tab 独立维护分页状态
	const tabData = reactive([{
			list: [],
			page: 1,
			hasMore: true,
			loading: false
		}, // 待支付
		{
			list: [],
			page: 1,
			hasMore: true,
			loading: false
		}, // 待会诊
		{
			list: [],
			page: 1,
			hasMore: true,
			loading: false
		}, // 待评价
	]);

	const pageSize = 3;
	const statusMap = {
		0: "待支付",
		1: "待會診",
		2: "待評價",
	};
	const statusColorMap = {
		0: "#459767", // 待支付
		1: "#3574cc", // 待会诊
		2: "#ff5500", // 待评价
	};
	const buttonMap = {
		0: [{
				text: "取消訂單",
				color: "#ff6a6a",
				borderColor: "#ff6a6a",
				action: "cancel"
			},
			{
				text: "立即支付",
				color: "#459767",
				borderColor: "#459767",
				action: "pay"
			},
		],
		1: [{
				text: "上傳病歷",
				color: "#3574cc",
				borderColor: "#3574cc",
				action: "upload"
			},
			{
				text: "取消訂單",
				color: "#ff6a6a",
				borderColor: "#ff6a6a",
				action: "cancel"
			},
			{
				text: "視頻",
				color: "#459767",
				borderColor: "#459767",
				action: "video"
			},
		],
		2: [{
			text: "評價",
			color: "#ff5500",
			borderColor: "#ff5500",
			action: "review"
		}],
	};

	const actions = {
		cancel: (item) => {
			showToast("取消订单");
			console.log("取消订单", item.orderId);
		},
		pay: (item) => console.log("立即支付", item.orderId),
		upload: (item) => {
			console.log("上传病历", item.orderId);
			jumpToNextPage(`/pagesB/apptConsult/historyMedical`);
		},
		video: (item) => console.log("视频会诊", item.orderId),
		review: (item) => {
			console.log("评价订单", item.orderId);
			jumpToNextPage(`/pagesB/mineGird/evaluate?orderId=?${item.orderId}`);
		},
	};

	const handleAction = (actionKey, item) => {
		if (actions[actionKey]) actions[actionKey](item);
	};
	// 模拟完整数据源，每个 tab 一份
	const mockData = {
		0: [{
				orderId: "20001",
				doctorName: "趙敏",
				department: "眼科",
				hospital: "環球港醫網醫院",
				specialty: "白內障",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "李麗",
				time: "2025-09-10 10:00:00",
				money: 150,
				payType: "微信支付",
				status: 0,
			},
			{
				orderId: "20002",
				doctorName: "錢芳",
				department: "內分泌科",
				hospital: "環球港醫網醫院",
				specialty: "糖尿病",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "張偉",
				time: "2025-09-15 16:30:00",
				money: 200,
				payType: "微信支付",
				status: 0,
			},
		],
		1: [{
				orderId: "30001",
				doctorName: "周傑",
				department: "骨科",
				hospital: "環球港醫網醫院",
				specialty: "關節炎",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "王小紅",
				time: "2025-09-12 09:00:00",
				money: 200,
				payType: "微信支付",
				status: 1,
			},
			{
				orderId: "30002",
				doctorName: "陳超",
				department: "婦科",
				hospital: "環球港醫網醫院",
				specialty: "月經不調",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "趙麗",
				time: "2025-09-14 11:00:00",
				money: 220,
				payType: "微信支付",
				status: 1,
			},
		],
		2: [{
				orderId: "40001",
				doctorName: "孫燕",
				department: "耳鼻喉科",
				hospital: "環球港醫網醫院",
				specialty: "過敏性鼻炎",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "陳濤",
				time: "2025-09-13 14:00:00",
				money: 90,
				payType: "微信支付",
				status: 2,
			},
			{
				orderId: "40002",
				doctorName: "吳海",
				department: "口腔科",
				hospital: "環球港醫網醫院",
				specialty: "牙痛",
				avatar: "https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGa9ouome5p1ElBUxb-Zw6G2U1P2d_AACzyAAAi5q2VWUGAAB81hCtcs2BA.png",
				patient: "劉洋",
				time: "2025-09-15 18:00:00",
				money: 50,
				payType: "微信支付",
				status: 2,
			},
		],
	};

	// 切换 tab
	const changeTabs = ({
		index
	}) => {
		tabsCurrent.value = index;
		// 切换 tab 时滚动到顶部
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0,
		});
		if (tabData[index].list.length === 0) {
			loadCards();
		}
	};

	// 模拟接口请求
	const loadCards = () => {
		const currentTab = tabData[tabsCurrent.value]; // 当前 tab 的状态对象
		if (currentTab.loading || !currentTab.hasMore) return;

		currentTab.loading = true;

		const start = (currentTab.page - 1) * pageSize;
		const end = start + pageSize;
		const sourceData = mockData[tabsCurrent.value] || [];
		const newData = sourceData.slice(start, end);

		if (newData.length === 0) {
			currentTab.hasMore = false;
			currentTab.loading = false;
			return;
		}

		// 👇 把数据塞进当前 tab
		currentTab.list = [...currentTab.list, ...newData];
		currentTab.page++;
		currentTab.loading = false;
	};

	// 页面触底事件（setup 顶层）
	onReachBottom(() => {
		console.log("触底加载更多");
		loadCards();
	});

	// 页面初始化加载第一个 tab
	loadCards();
</script>

<style scoped lang="scss">
	::v-deep .u-cell__body {
		height: 56rpx;
		padding: 13px 15px !important;
	}

	.tabs-box {
		width: 100%;
		padding: 0 48rpx;
		background: #fafbff;
		box-sizing: border-box;
		position: sticky;
		z-index: 999;
		top: 0;
	}

	.box {
		// overflow: auto;
		width: 100vw;
		// height: 100vh;
		min-height: calc(100vh - 88rpx);
		box-sizing: border-box;
		background: #fafbff;

		.content {
			padding: 32rpx 48rpx;
			padding-top: 0;
			box-sizing: border-box;
			width: 100%;
			height: auto;
			background-color: #fafbff;

			// margin: 176rpx 0 50rpx 0;
			// overflow: auto;
			.content-card {
				box-sizing: border-box;
				background-color: #fff;
				padding: 38rpx 32rpx 32rpx 32rpx;
				box-shadow: 0rpx 6rpx 12rpx 0rpx rgba(0, 0, 0, 0.0196);
				border-radius: 20rpx;

				.card-title {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.doctor-info {
					display: flex;
					justify-content: flex-start;
				}

				.reocrd-info {
					background-color: #f5f5f5;
					border-radius: 20rpx;
				}

				// .actions {
				// 	width: 100%;
				// 	display: flex;
				// 	justify-content: end;
				// 	// background: red;
				// 	// gap: 24rpx;
				// 	.confirmPay,
				// 	.onVideo {
				// 		width: 160rpx;
				// 		height: 56rpx;
				// 		border-radius: 28rpx;
				// 	}
				// }
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
					}
				}
			}
		}
	}

	.status-box {
		width: 100%;
		text-align: center;
		padding: 24rpx 0;
		font-size: 26rpx;
		color: #999;

		.loading {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.no-more {
			color: #bbb;
		}
	}

	.ml-12 {
		margin-left: 12rpx;
	}
</style>