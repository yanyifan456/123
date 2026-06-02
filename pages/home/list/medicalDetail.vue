<template>
	<view class="page">
		<view class="medical-box">
			<scroll-view scroll-y="true" class="scroll-box">
				<view class="medical-photo">
					<image
						:src="detail.photo && detail.photo !== '-' ? detail.photo : '/static/images/medical.png'"
						mode=""
						class="img-box"
					></image>
				</view>
				<view class="medical-content">
					<view class="medical-info">
						<view class="medical-name">
							<view class="medical-price">
								<view class="">HK$</view>
								<view class="">{{ detail.unitPrice }}</view>
							</view>
							<view class="medical-tips">*包含税费</view>
						</view>
						<view class="medical-name-detail">
							<view class="medical-type" v-if="detail.classType == 0">處方藥</view>
							<view class="">{{ detail.name }}</view>
						</view>
						<view class="detail-company">
							<view class="icon-box-24">
								<image src="/static/images/medical-room.png" mode="" class="img-box"></image>
							</view>
							<view class="">
								{{ detail.pharmacyName && detail.pharmacyName }}
							</view>
						</view>
					</view>
					<view class="medical-switch-box">
						<view :class="{ active: currentSwitch == 0 }" @click="currentSwitch = 0">商品详情</view>
						<view :class="{ active: currentSwitch == 1 }" @click="currentSwitch = 1">产品规格</view>
					</view>
					<view v-if="currentSwitch == 0" class="medical-detail">{{ detail.medicineDesc || "---" }}</view>
					<view v-if="currentSwitch == 1" class="medical-spec">
						<view class="">
							<view class="">
								{{ "[功能]" }}
							</view>
							<view class="">
								{{ detail.indication || "---" }}
							</view>
						</view>
						<view class="">
							<view class="">
								{{ "[包装单位]" }}
							</view>
							<view class="">
								{{ "---" }}
							</view>
						</view>
						<view class="">
							<view class="">
								{{ "[生产厂家]" }}
							</view>
							<view class="">
								{{ detail.company || "---" }}
							</view>
						</view>
						<view class="">
							<view class="">
								{{ "[用法用量]" }}
							</view>
							<view class="">
								{{ detail.signetur || "---" }}
							</view>
						</view>
						<view class="">
							<view class="">
								{{ "[不良反应]" }}
							</view>
							<view class="">
								{{ detail.adverseReaction || "---" }}
							</view>
						</view>
						<view class="">
							<view class="">
								{{ "[药品禁忌]" }}
							</view>
							<view class="">
								{{ detail.contraind || "---" }}
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="bottom-box">
				<view class="btn-box">
					<view class="btn-left">
						<view class="btn-home" @click="goHome">
							<view class="icon-box-36">
								<image src="/static/images/home.png" class="img-box" mode=""></image>
							</view>
							<view class="">首页</view>
						</view>
						<view class="btn-cart" @click="goCart">
							<view class="icon-box-36">
								<image src="/static/images/cart.png" class="img-box" mode=""></image>
							</view>
							<view class="">购物车</view>
						</view>
					</view>
					<view class="btn-right">
						<view class="add-cart" @click="addCart">加入购物车</view>
						<view class="add-order" @click="addOrder">
							{{ detail.classType == 0 ? "立即预约" : "立即购买" }}
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
	<up-popup v-model:show="show" closeable>
		<view class="popup-box">
			<view class="popup-info">
				<view class="popup-pic">
					<image
						:src="detail.photo && detail.photo !== '-' ? detail.photo : '/static/images/medical.png'"
						mode=""
						class="img-box"
						style="border-radius: 20rpx"
					></image>
				</view>
				<view class="popup-name">
					<view class="">{{ detail.name }}</view>
					<view class="medical-name">
						<view class="medical-price">
							<view class="">HK$</view>
							<view class="">{{ detail.unitPrice }}</view>
						</view>
						<view class="medical-tips">*包含税费和快递费</view>
					</view>
				</view>
			</view>
			<view class="popup-num">
				<view class="">购买数量</view>
				<view class="">
					<view class="minus-box" @click="minus" :style="{ opacity: buyNum <= 1 ? 0.4 : 1 }">
						<up-icon name="minus" color="#a2a2a2" size="8"></up-icon>
					</view>
					<view class="input-num"><input type="number" :value="buyNum" disabled class="input-number" /></view>
					<view class="plus-box" @click="plus" :style="{ opacity: buyNum >= 10 ? 0.4 : 1 }">
						<up-icon name="plus" color="#a2a2a2" size="8"></up-icon>
					</view>
				</view>
			</view>
			<view class="popup-total">
				<view class="popup-total-price">
					<view class="">合计</view>
					<view class="medical-price">
						<view class="">HK$</view>
						<view class="">{{ totalPrice }}</view>
					</view>
				</view>
				<view class="add-cart" v-if="clickType == 'add'" @click="confirmAddCart">加入购物车</view>
				<view class="add-order" v-if="clickType == 'buy'" @click="confirmNowBuy">立即购买</view>
			</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";

import { getMedicalDetail, addToCart } from "@/api/base.js";
const medicineId = ref(null);
onLoad(({ id }) => {
	medicineId.value = id;
});
onShow(() => {
	getDetail();
});
const currentSwitch = ref(0);

const goHome = () => {
	uni.switchTab({
		url: "/pages/home/home",
	});
};

const goCart = () => {
	uni.switchTab({
		url: "/pages/cart/cart",
	});
};
const show = ref(false);
const buyNum = ref(1);
const clickType = ref("add"); // add 加入购物车  buy 立即购买
const totalPrice = computed(() => {
	const price = Number(detail.value.unitPrice || 0);
	return (price * buyNum.value).toFixed(2);
});
const minus = () => {
	if (buyNum.value <= 1) {
		uni.showToast({
			title: "最少购买1件",
			icon: "none",
		});
		return;
	}
	buyNum.value--;
};

const plus = () => {
	if (buyNum.value >= 10) {
		uni.showToast({
			title: "最多购买10件",
			icon: "none",
		});
		return;
	}
	buyNum.value++;
};

const addCart = async () => {
	buyNum.value = 1;
	show.value = true;
	clickType.value = "add";
};
const addOrder = () => {
	buyNum.value = 1;
	if (detail.value.classType == 1) {
		clickType.value = "buy";
		show.value = true;
	} else {
		uni.navigateTo({
			url: "/pages/home/list/goDoctor",
		});
	}
};

const confirmAddCart = async () => {
	try {
		const params = {
			userId: uni.getStorageSync("userId"),
			medicineId: medicineId.value * 1,
			shopNum: buyNum.value * 1,
		};
		const res = await addToCart(params);
		uni.showToast({
			icon: "success",
			title: res.data.message || "药品成功已加入购物车",
		});
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
		show.value = false;
	}
};

const confirmNowBuy = () => {
	uni.navigateTo({
		url: `/pages/cart/confirm?ids=${medicineId.value}&num=${buyNum.value}&type=${"detail"}`,
	});
};
const detail = ref({});
const getDetail = async () => {
	try {
		uni.showLoading({
			title: "正在获取药品详情，请稍等~",
			mask: true,
			icon: "loading",
		});
		const params = {
			id: medicineId.value,
		};
		const res = await getMedicalDetail(params);
		detail.value = res.data.data;
	} catch (error) {
		//TODO handle the exception
	} finally {
		uni.hideLoading();
	}
};
</script>

<style scoped lang="scss">
.medical-box {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}
.scroll-box {
	flex: 1;
	padding-bottom: 176rpx;
}
.medical-photo {
	width: 750rpx;
	height: 750rpx;
}
.medical-content {
	width: 100%;
	padding: 0 48rpx;
}
.medical-info {
	margin-top: 24rpx;
	background-color: $bg-card;
	border-radius: 20rpx;
	box-shadow: $box-shadow;
	padding: 32rpx;
}
.medical-name {
	@include flex-between;
}
.medical-price {
	@include flex-start;
	> :nth-child(1) {
		color: $danger;
		font-size: 24rpx;
	}
	> :nth-child(2) {
		color: $danger;
		font-size: 32rpx;
	}
}
.medical-tips {
	color: $text-secondary;
	font-size: 20rpx;
}
.medical-name-detail {
	margin-top: 24rpx;
	color: $text-primary;
	font-size: 32rpx;
	@include flex-start;
}
.medical-type {
	border-radius: 10rpx;
	width: 72rpx;
	height: 30rpx;
	background-color: $mark;
	color: $bg-card;
	font-size: 20rpx;
	margin-right: 8rpx;
	@include flex-center;
}
.detail-company {
	margin-top: $space-12;
	color: $text-primary;
	font-size: $font-20;
	@include flex-start;
	> :nth-child(1) {
		margin-right: 8rpx;
	}
}
.medical-switch-box {
	width: 100%;
	height: 80rpx;
	background-color: $bg-card;
	box-shadow: $box-shadow;
	border-radius: 20rpx;
	margin-top: 32rpx;
	@include flex-between;
	> view {
		width: 50%;
		height: 100%;
		@include flex-center;
		color: $text-secondary;
		font-size: 28rpx;
	}
	& .active {
		color: $primary-light;
	}
}
.medical-detail {
	background-color: $bg-card;
	box-shadow: $box-shadow;
	border-radius: 20rpx;
	margin-top: 32rpx;
	color: $text-secondary;
	font-size: 24rpx;
	padding: 32rpx;
}
.medical-spec {
	background-color: $bg-card;
	box-shadow: $box-shadow;
	border-radius: 20rpx;
	margin: 32rpx 0;
	padding: 32rpx;

	> view {
		padding: 20rpx 0;
		@include flex-start;
		> :nth-child(1) {
			margin-right: 24rpx;
			flex-shrink: 0;
			align-self: flex-start;
			font-size: 28rpx;
			color: $text-primary;
			font-weight: 700;
		}
		> :nth-child(2) {
			font-size: 24rpx;
			color: $text-secondary;
			font-weight: 400;
		}
	}
	> view:not(:last-child) {
		border-bottom: 1px solid $border-color;
	}
}
.bottom-box {
	width: 100%;
	height: 176rpx;
	background-color: $bg-card;
	padding: 0 48rpx;
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 10;
}
.btn-box {
	width: 100%;
	height: 108rpx;
	@include flex-between;
}
.btn-left,
.btn-right {
	@include flex-between;
}
.btn-right {
	@include flex-between;
	width: 416rpx;
}
.add-cart {
	width: 200rpx;
	height: 80rpx;
	background-color: $mark;
	color: $bg-card;
	@include flex-center;
	font-size: 28rpx;
	border-radius: 40rpx;
}
.add-order {
	width: 200rpx;
	height: 80rpx;
	background-color: $primary-light;
	color: $bg-card;
	@include flex-center;
	font-size: 28rpx;
	border-radius: 40rpx;
}
.btn-home,
.btn-cart {
	@include flex-col-center;
	font-size: 20rpx;
	> :nth-child(2) {
		margin-top: 8rpx;
	}
}
.btn-home {
	margin-right: 48rpx;
}
.popup-box {
	box-sizing: border-box;
	min-height: 400rpx;
	padding: 32rpx 60rpx 32rpx 48rpx;
}
.popup-info {
	@include flex-between;
}
.popup-pic {
	width: 128rpx;
	height: 128rpx;
	flex-shrink: 0;
	margin-right: 24rpx;
}
.popup-name {
	flex: 1;
	> :nth-child(2) {
		margin-top: 24rpx;
	}
}
.popup-num {
	margin-top: 48rpx;
	@include flex-between;
	> :nth-child(1) {
		color: $text-primary;
		font-size: 24rpx;
	}
	> :nth-child(2) {
		@include flex-start;
		width: 132rpx;
		color: $text-primary;
		font-size: 24rpx;
	}
}

.minus-box {
	width: 32rpx;
	height: 32rpx;
	background-color: $border-color;
	@include flex-center;
	border-radius: 8rpx 0 0 8rpx;
}
.plus-box {
	width: 32rpx;
	height: 32rpx;
	background-color: $border-color;
	@include flex-center;
	border-radius: 0 8rpx 8rpx 0;
}
.input-num {
	background-color: $border-color;
	width: 64rpx;
	height: 32rpx;
	margin: 0 2rpx;
}
.input-number {
	font-size: 24rpx;
	color: $text-regular;
	text-align: center;
}
.popup-total {
	@include flex-between;
	margin-top: 96rpx;
}
.popup-total-price {
	@include flex-start;
	> :nth-child(1) {
		font-size: 24rpx;
		color: $text-regular;
		line-height: 1;
		margin-right: 16rpx;
	}
}
</style>
