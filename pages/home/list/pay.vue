<template>
	<view class="page">
		<view class="content-box">
			<view class="hospital-box">
				<view>
					<view>医院</view>
					<view>{{ props.hospital }}</view>
				</view>
				<view>
					<view>医生</view>
					<view>{{ props.doctorName }}</view>
					<view>{{ props.departName }}</view>
				</view>
			</view>
			<view class="history-box" @click="handleClickShow">
				<view class="">预约时间</view>
				<view class="">
					<view class="">{{ checkTime || "请选择预约时间" }}</view>
					<uni-icons type="right" size="19" color="#434343"></uni-icons>
				</view>
			</view>
			<!-- <view class="history-box" @click="goPageRecord">
				<view class="">历史病历上传</view>
				<uni-icons type="right" size="19" color="#434343"></uni-icons>
			</view> -->
			<view class="medical-info-box">
				<view class="medical-info-title">病情描述</view>
				<up-textarea
					border="surround"
					v-model="conditionDesc"
					count
					placeholder="请输入内容"
					autoHeight
					class="textarea-box"
				></up-textarea>
			</view>
			<view class="cost-box">
				<view class="">会诊费用</view>
				<view>
					<view class="">HK$</view>
					<view class="">{{ props.mainlandFee }}</view>
				</view>
			</view>
			<view class="pay-box">
				<view>支付类型</view>
				<view>支付宝</view>
			</view>
		</view>
		<view class="bottom-box">
			<view class="bottom-price">
				<view class="">合计：</view>
				<view class="">
					<view class="">HK$</view>
					<view class="">{{ props.mainlandFee }}</view>
				</view>
			</view>
			<view class="bottom-btn" @click="open">立即支付</view>
		</view>
	</view>
	<up-popup v-model:show="show" closeable>
		<view class="popup-box">
			<view class="popup-title">预约时间选择</view>
			<view class="popup-tips">此时间段为医生上班时间，可根据您和医生的时间进行选择</view>
			<view class="popup-content">
				<view class="popup-content-left">
					<view
						v-for="(item, index) in dateList"
						:key="index"
						class="content-left-card"
						:class="{ 'active-date': currentDate == index }"
						@click="hanldeClickDate(index)"
					>
						{{ formatDate(item) }}
					</view>
				</view>
				<scroll-view scroll-y="true" class="popup-content-right" :scroll-top="scrollTop">
					<view
						v-for="(item, index) in timeList"
						:key="item.id"
						class="content-right-card"
						:class="{
							'active-time': currentTime == index && item.scheduleTag == 1,
							'is-active': item.scheduleTag != 1,
						}"
						@click="hanldeClickTime(item, index)"
					>
						<view class="">
							{{ item.scheduleTime }}
						</view>
						<view class="">
							{{ item.scheduleTag == 1 ? "" : "不可预约" }}
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn" :class="{ 'popup-btn-status': currentTime == null }" @click="submitDate">确定</view>
		</view>
	</up-popup>
	<up-popup v-model:show="showTip" closeable>
		<view class="popup-boxTip">
			<view class="popup-titleTip">就診確認</view>
			<view class="popup-textTip">
				<view>尊敬的用户您好，為確保您獲得規範的醫療服務，請確認以下信息：</view>
				<view>
					1.本平台僅提供健康諮詢及複診服務，不適用於急症、危重症患者。如有緊急情況，請立即前往就近醫療機構就診。
				</view>
				<view>2. 醫生根據您提供的信息進行診療，診斷結果僅供參考，以線下就診為準。</view>
				<view>3. 請確保您提供的信息真實、準確、完整，因信息不實導致的後果由您自行承擔。</view>
			</view>
		</view>
		<view class="popup-bottomTip">
			<view class="popup-btn-cancelTip" @click="close">取消</view>
			<view class="popup-btnTip" @click="submit">確定</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
	createPayOrder,
	checkDoctorSchedule,
	checkDoctorScheduleDetail,
	wechatPay,
	AliPay,
	cancelOrderNotPay,
	addPayOrder,
} from "@/api/base.js";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const props = ref({});
onLoad(({ data }) => {
	props.value = JSON.parse(data);
	console.log(props.value);
});

const goPageRecord = () => {
	uni.navigateTo({
		url: "/pages/mine/minelist/recordDetail",
	});
};

const conditionDesc = ref("");
const createOrder = async () => {
	try {
		// ===== 1. 创建订单 =====
		const orderParams = {
			orderUserId: uni.getStorageSync("userId"),
			doctorId: props.value.doctorId,
			doctorSkill: props.value.proSkill,
			orderFee: props.value.mainlandFee,
			scheduleId: checkTimeId.value,
			orderTime: checkTime.value,
			condDesc: conditionDesc.value,
			checkTag: "0",
			orderState: "0",
		};

		const orderRes = await createPayOrder(orderParams);
		console.log(orderRes);
		if (orderRes.code != 200 || orderRes.data.code != 1000) {
			uni.showToast({
				title: orderRes.data.message || "创建订单失败",
				icon: "none",
			});
			return;
		}

		const orderData = orderRes.data.data;

		uni.showToast({
			title: "订单创建成功,即将前往支付~",
			icon: "none",
		});

		// ===== 2. 获取支付信息 =====
		// （建议你后端返回 orderString，而不是再调 AliPay）
		const payParams = {
			orderNo: orderData.orderId,
			payFee: orderData.orderFee,
		};
		console.log(payParams);
		const payRes = await AliPay(payParams);
		console.log(payRes);
		if (payRes.code != 200) {
			uni.showToast({
				title: "获取支付信息失败",
				icon: "none",
			});

			await cancelOrderNo(orderData.scheduleId, orderData.orderId, "4");
			return;
		}

		const payData = payRes.data;
		console.log(payData);
		var EnvUtils = plus.android.importClass("com.alipay.sdk.app.EnvUtils");
		EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
		// ===== 3. 发起支付 =====
		uni.requestPayment({
			provider: "alipay",
			orderInfo: payData,

			success: async (payResult) => {
				try {
					uni.showLoading({ title: "处理中..." });

					// ===== 4. 支付成功通知后端 =====
					const confirmParams = {
						orderId: orderData.orderId,
						orderState: "6",
						outChargeId: payResult.tradeno,
						orderFee: orderData.orderFee,
						orderUserId: orderData.orderUserId,
					};
					console.log(confirmParams);
					await addPayOrder(confirmParams);

					uni.hideLoading();
					uni.reLaunch({
						url: "/pages/home/list/paySuccess",
					});
					// uni.showToast({
					// 	title: "支付成功",
					// 	icon: "success",
					// });
				} catch (err) {
					console.log(err);
					uni.showToast({
						title: "订单更新失败",
						icon: "none",
					});
					await cancelOrderNo(orderData.scheduleId, orderData.orderId, "4");
				} finally {
					uni.hideLoading();
				}
			},

			fail: async (err) => {
				console.log(err);
				uni.showToast({
					title: "支付失败",
					icon: "none",
				});
				await cancelOrderNo(orderData.scheduleId, orderData.orderId, "4");
			},
		});
	} catch (error) {
		console.error(error);
		uni.showToast({
			title: "系统异常",
			icon: "none",
		});
	}
};
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
const show = ref(false);
const checkTime = ref(null);
const checkTimeId = ref(null);
const handleClickShow = () => {
	getDateList();
};
const weekMap = ["日", "一", "二", "三", "四", "五", "六"];

const formatDate = (dateStr) => {
	const d = dayjs(dateStr);
	const week = weekMap[d.day()];
	return `周${week} ${d.format("MM月DD日")}`;
};
const currentDate = ref(0);
const hanldeClickDate = async (index) => {
	currentDate.value = index;
	currentTime.value = null;
	checkTime.value = null;
	scrollTop.value = 1;
	await nextTick();
	scrollTop.value = 0;
	getTimeList(dateList.value[currentDate.value]);
};
const dateList = ref([]);
const currentTime = ref(null);
const scrollTop = ref(0);
const getDateList = async () => {
	try {
		const params = {
			doctorId: props.value.doctorId,
			currentTime: today,
		};
		console.log(params);
		const res = await checkDoctorSchedule(params);
		if (res.data.data.length == 0) {
			uni.showToast({
				title: "当前暂无预约班次，无法预约",
				icon: "none",
				mask: true,
			});
			return;
		}
		dateList.value = res.data.data;
		console.log(dateList.value);
		getTimeList(dateList.value[currentDate.value]);
	} catch (error) {
		//TODO handle the exception
		console.log(error);
		uni.showToast({
			title: "预约时间拉取失败，暂时无法预约",
			icon: "none",
			mask: true,
		});
	} finally {
	}
};
const hanldeClickTime = (item, index) => {
	if (item.scheduleTag == 1) {
		currentTime.value = index;
	}
};
const today = dayjs().format("YYYY-MM-DD");
const timeList = ref([]);
const getTimeList = async (time) => {
	try {
		const params = {
			currentTime: time,
			doctorId: props.value.doctorId,
		};
		const res = await checkDoctorScheduleDetail(params);
		timeList.value = res.data.data;
		show.value = true;
		console.log(res);
	} catch (error) {
		//TODO handle the exception
		uni.showToast({
			title: "预约班次拉取失败，暂时无法预约",
			icon: "none",
			mask: true,
		});
	}
};
const submitDate = () => {
	if (currentTime.value == null) {
		return;
	}
	checkTime.value =
		timeList.value[currentTime.value].scheduleDay + " " + timeList.value[currentTime.value].scheduleTime;
	checkTimeId.value = timeList.value[currentTime.value].id;
	show.value = false;
};
const handleClick = () => {
	console.log(checkTimeId.value);
	const medicalRecord = uni.getStorageSync("medicalRecord") || {};
	const casePhoto = JSON.parse(medicalRecord.casePhoto || "[]");
	const diagnosisPhoto = JSON.parse(medicalRecord.diagnosisPhoto || "[]");
	const reportPhoto = JSON.parse(medicalRecord.reportPhoto || "[]");
	console.log(medicalRecord);
	if (!checkTimeId.value) {
		close();
		uni.showToast({
			title: "请选择需要预约的时间段",
			icon: "none",
			mask: true,
		});
		return;
	}

	// if (casePhoto.length == 0) {
	// 	uni.showToast({
	// 		title: "请上传病历图片",
	// 		icon: "none",
	// 		mask: true,
	// 	});
	// 	return;
	// }
	// if (diagnosisPhoto.length == 0) {
	// 	uni.showToast({
	// 		title: "请上传诊断图片",
	// 		icon: "none",
	// 		mask: true,
	// 	});
	// 	return;
	// }
	// if (reportPhoto.length == 0) {
	// 	uni.showToast({
	// 		title: "请上传检查报告图片",
	// 		icon: "none",
	// 		mask: true,
	// 	});
	// 	return;
	// }
	if (!conditionDesc.value) {
		uni.showToast({
			title: "请输入病情描述",
			icon: "none",
			mask: true,
		});
		return;
	}
	// const payUrl = "https://hqgy.gzxinxingyiyuan.com/pay/index.html?a=b ";

	// plus.runtime.openURL(payUrl);
	// return;
	createOrder();
};

const showTip = ref(false);
const open = () => {
	showTip.value = true;
};
const close = () => {
	showTip.value = false;
};

const submit = () => {
	handleClick();
};
</script>

<style lang="scss" scoped>
.content-box {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
.hospital-box {
	width: 100%;
	height: 176rpx;
	background-color: rgba($bg-card, 1);
	box-shadow: $box-shadow;
	padding: $space-32 $space-48;
	> :nth-child(1) {
		@include flex-start;
		> :nth-child(1) {
			color: $text-secondary;
			margin-right: $space-16;
			font-size: $font-28;
		}
		> :nth-child(2) {
			color: $text-regular;
			margin-right: $space-16;
			font-size: $font-28;
		}
	}
	> :nth-child(2) {
		margin-top: $space-32;
		@include flex-start;
		> :nth-child(1) {
			color: $text-secondary;
			margin-right: $space-16;
			font-size: $font-28;
		}
		> :not(:first-child) {
			color: $text-regular;
			margin-right: $space-24;
			font-size: $font-28;
		}
	}
}
.history-box {
	height: 108rpx;
	margin-top: $space-24;
	background-color: rgba($bg-card, 1);
	box-shadow: $box-shadow;
	padding: $space-32 $space-48;
	font-size: $font-28;
	color: $text-regular;
	> :nth-child(2) {
		@include flex-start;
		> :nth-child(1) {
			color: $text-secondary;
			font-size: $font-24;
		}
	}
	@include flex-between;
}
.medical-info-box {
	background-color: rgba($bg-card, 1);
	box-shadow: $box-shadow;
	padding: $space-32 $space-48;
	margin-top: 24rpx;
	.medical-info-title {
		color: $text-primary;
		font-weight: bold;
		font-size: 28rpx;
	}
	.textarea-box {
		margin-top: 24rpx;
		// border: 1px solid $border-color;
		padding: 16rpx;
		color: $text-regular;
		line-height: 1;
		font-size: 24rpx;
	}
}
.cost-box {
	height: 108rpx;
	margin-top: $space-24;
	background-color: rgba($bg-card, 1);
	border-radius: $radius-20;
	box-shadow: $box-shadow;
	padding: $space-32 $space-48;
	font-size: $font-28;
	color: $text-regular;
	@include flex-between;
	> :nth-child(2) {
		font-size: $font-32;
		color: $danger;
		@include flex-start-baseline;
		> :nth-child(1) {
			font-size: $font-24;
			color: $danger;
		}
	}
}
.pay-box {
	height: 108rpx;
	margin-top: $space-24;
	background-color: rgba($bg-card, 1);
	border-radius: $radius-20;
	box-shadow: $box-shadow;
	padding: $space-32 $space-48;
	font-size: $font-28;
	color: $text-regular;
	@include flex-between;
	> :nth-child(2) {
		font-size: $font-28;
		color: $text-regular;
	}
}
.bottom-box {
	background-color: rgba($bg-card, 1);
	width: 100%;
	height: 176rpx;
	padding: $space-16 $space-48 68rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 10;
	@include flex-between;
	.bottom-price {
		@include flex-start;
		line-height: 1;
		> :nth-child(1) {
			font-size: $font-24;
			color: $text-regular;
			margin-right: 16rpx;
		}
		> :nth-child(2) {
			font-size: $font-28;
			color: $danger;
			@include flex-start;
			> :nth-child(2) {
				font-size: $font-32;
			}
		}
	}
	.bottom-btn {
		width: 240rpx;
		height: 92rpx;
		background-color: $primary;
		border-radius: $radius-48;
		color: #fff;
		font-size: $font-28;
		transition: background-color 0.2s ease;
		@include flex-center;
		&:active {
			background-color: rgba($primary, 0.8);
		}
	}
}
.popup-box {
	box-sizing: border-box;
	min-height: 400rpx;
	padding: 32rpx 48rpx;
}
.popup-title {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	@include flex-center;
}

.popup-tips {
	font-weight: 400;
	font-size: 20rpx;
	color: $text-secondary;
	margin-top: 16rpx;
	@include flex-center;
}
.popup-content {
	margin-top: 24rpx;
	width: 100%;
	height: 754rpx;
	@include flex-between;
}
.popup-content-left {
	width: 240rpx;
	height: 100%;
	margin-right: 16rpx;
	background-color: rgba($bg-page, 1);
}
.content-left-card {
	width: 100%;
	height: 80rpx;
	@include flex-center;
	font-weight: 400;
	font-size: 24rpx;
	color: $text-primary;
}
.active-date {
	font-weight: bold;
	background-color: rgba($bg-card, 1);
}
.popup-content-right {
	flex-shrink: 1;
	height: 754rpx;
	overflow: hidden;
	background-color: rgba($bg-card, 1);
	box-sizing: border-box;
}
.content-right-card {
	width: 100%;
	height: 80rpx;
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	border: 2rpx solid $border-color;
	margin-bottom: 16rpx;
	padding: 24rpx;
	font-weight: 400;
	font-size: 24rpx;
	color: $text-regular;
	@include flex-between;
}
.is-active {
	// background-color: rgba($primary-light, 0.4);
	// border-color: rgba($primary-light, 1);
	color: rgba($text-secondary, 1);
}
.active-time {
	background-color: rgba($primary-light, 0.4);
	border-color: rgba($primary-light, 1);
	color: rgba($bg-card, 1);
}
.popup-bottom {
	margin-top: 0rpx;
	width: 100%;
	height: 200rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
}

.popup-btn {
	width: 100%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($bg-card, 1);
	font-weight: 400;
	font-size: 28rpx;
}
.popup-btn-status {
	background-color: rgba($text-secondary, 1);
}

// ===========
.popup-boxTip {
	box-sizing: border-box;
	height: fit-content;
	padding: 32rpx 48rpx;
}

.popup-titleTip {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	@include flex-center;
}

.popup-textTip {
	margin-top: 32rpx;
	font-weight: 400;
	font-size: 28rpx;
	color: $text-secondary;
}

.popup-bottomTip {
	margin-top: 0rpx;
	width: 100%;
	height: 200rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
	@include flex-between;
	gap: 24rpx;
}

.popup-btnTip {
	width: 50%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($bg-card, 1);
	font-weight: 600;
	font-size: 28rpx;
}

.popup-btn-cancelTip {
	width: 50%;
	height: 92rpx;
	background-color: rgba($bg-card, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($text-primary, 1);
	font-weight: 600;
	font-size: 28rpx;
	border: 1px solid $border-color;
}

// .popup-btn-status {
// 	background-color: rgba($text-secondary, 1);
// }
</style>
