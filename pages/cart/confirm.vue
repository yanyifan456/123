<template>
	<view class="page pages">
		<scroll-view scroll-y="true" class="scroll-box">
			<view class="address-box" @click="toPageAddress">
				<view class="">
					<image src="/static/images/gps.png" mode="" class="img-box"></image>
				</view>
				<view class="">
					<view class="" v-if="address.reciveUsername">
						<view class="">{{ address.reciveUsername }}</view>
						<view class="">{{ address.reciveTel }}</view>
					</view>
					<view class="">{{ address.reciveAddress || "请设置收货地址" }}</view>
				</view>
				<view class="">
					<image src="/static/images/arrow-right-line.png" mode="" class="img-box"></image>
				</view>
			</view>
			<view class="idCard-box">
				<view class="">證件信息</view>
				<view class="">
					<view class="">
						<image :src="userInfo.front || '/static/images/idCard1.png'" mode="" class="img-box"></image>
					</view>
					<view class="">
						<image :src="userInfo.back || '/static/images/idCard1.png'" mode="" class="img-box"></image>
					</view>
				</view>
			</view>
			<view class="medical-box">
				<view class="title">由環球港醫網配送</view>
				<view class="divider-box"></view>
				<view class="medical-info-box" v-for="item in goodsList" :key="item.id">
					<view class="medical-info-pic">
						<image
							:src="item.photo && item.photo !== '-' ? item.photo : '/static/images/medical.png'"
							mode=""
							class="img-box"
						></image>
					</view>
					<view class="medical-info-detail">
						<view class="medical-info-name">{{ item.name }}</view>
						<view class="medical-info-price">
							<view class="medical-price">
								<view class="">HK$</view>
								<view class="">{{ item.unitPrice }}</view>
							</view>
							<view class="">x{{ item.shopNum }}</view>
						</view>
						<view class="medical-info-tips">*包含税费</view>
					</view>
				</view>
			</view>
			<view class="order-summary">
				<!-- 商品金额 -->
				<view class="summary-item">
					<view class="summary-label">商品金额</view>
					<view class="summary-value">HK$ {{ totalPrice }}</view>
				</view>

				<!-- 支付方式 -->
				<view class="summary-item">
					<view class="summary-label">支付方式</view>
					<view class="summary-payment">
						<view class="payment-icon"></view>
						<view class="payment-text">支付宝</view>
					</view>
				</view>

				<!-- 分割线 -->
				<view class="summary-divider"></view>

				<!-- 实付金额 -->
				<view class="summary-total">
					<view class="summary-label"></view>
					<view class="summary-total-price">实付：HK$ {{ totalPrice }}</view>
				</view>
			</view>
		</scroll-view>
		<view class="bottom-box">
			<view class="popup-total-price">
				<view class="">合计</view>
				<view class="medical-price">
					<view class="">HK$</view>
					<view class="">{{ totalPrice }}</view>
				</view>
			</view>
			<view class="add-cart" @click="confirmAddCart">生成訂單</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from "vue";
import { getSelectedShopList, getAddressList, createTradeInfo, getMedicalDetail } from "@/api/base.js";
import { getuser } from "@/api/login.js";
import { onLoad, onShow } from "@dcloudio/uni-app";
const props = reactive({
	ids: [],
	type: "",
	num: null,
	medicineId: null,
});
onLoad(({ ids, num, type }) => {
	try {
		if (type == "cart") {
			props.type = type || "cart";
			props.ids = ids.split(",");
			getGoodsList();
		} else {
			console.log(111);
			props.type = type || "detail";
			props.num = type == "detail" ? num : null;
			props.medicineId = ids;
			getGoodsListDetail();
		}
		console.log(props);
	} catch (error) {
		//TODO handle the exception
	}
});

onShow(() => {
	// getGoodsList();
	getAddress();
	getUserInfo();
});

const toPageAddress = () => {
	uni.navigateTo({
		url: "/pages/mine/minelist/addressManage",
	});
};
const goodsList = ref([]);
const getGoodsList = async () => {
	try {
		const params = {
			idList: props.ids,
			userId: uni.getStorageSync("userId"),
		};
		const res = await getSelectedShopList(params);
		console.log(res);
		if (props.type == "detail") {
			goodsList.value = res.data.data.map((goods) => ({
				...goods,
				shopNum: props.num,
			}));
		} else {
			goodsList.value = res.data.data;
		}
		console.log(goodsList.value);
	} catch (error) {
		console.log("根据id获取商品列表error", error);
	} finally {
	}
};

const getGoodsListDetail = async () => {
	try {
		const params = { id: props.medicineId };
		const res = await getMedicalDetail(params);
		res.data.data.shopNum = props.num;
		const list = [res.data.data];
		goodsList.value = list;
	} catch (error) {
		console.log("根据id获取商品详情error", error);
	}
};
const totalPrice = computed(() => {
	let total = 0;

	goodsList.value.forEach((item) => {
		const num = item.shopNum;
		total += item.unitPrice * num;
	});

	return total.toFixed(2);
});
const address = ref({});
const getAddress = async () => {
	try {
		const params = { reciveTel: uni.getStorageSync("phone") };
		const res = await getAddressList(params);
		console.log(res);
		// 只取 defaultTag == 1 的地址
		const defaultAddress = res.data.data.find((addr) => addr.defaultTag == 1);
		console.log(defaultAddress);
		if (defaultAddress) {
			address.value = defaultAddress; // 单个默认地址
		} else {
			address.value = {}; // 没有默认地址时置空或处理逻辑
		}
		console.log(address.value);
	} catch (error) {
		console.log("获取地址列表error", error);
	} finally {
	}
};

const userInfo = ref({});
const getUserInfo = async () => {
	try {
		const params = { serialNumber: uni.getStorageSync("phone") };
		const res = await getuser(params);
		userInfo.value = res.data.data;
	} catch (error) {
		//TODO handle the exception
	} finally {
	}
};
const confirmAddCart = () => {
	try {
		if (!address.value.reciveTel) {
			uni.showToast({
				title: "暂无收货地址，无法提交",
				icon: "none",
				mask: true,
			});
			return;
		}
		uni.showModal({
			title: "提示",
			content: "订单即刻生成，是否前往支付？",
			confirmText: "确定",
			cancelText: "稍后再说",
			success: (res) => {
				if (res.confirm) {
					// 执行加入购物车逻辑
					return;
					createTrade("1");
				} else if (res.cancel) {
					return;
					createTrade("0");
				}
			},
		});
	} catch (error) {
		console.error(error);
	}
};
const createTrade = async (payTag) => {
	try {
		const medicineList = goodsList.value.map((goods) => {
			return {
				medicineId: goods.id,
				medicineCun: goods.shopNum * 1,
			};
		});
		const params = {
			tradeType: "1",
			tradeFee: totalPrice.value * 1,
			tradeStatus: "0",
			delTag: "0",
			tradeStaff: uni.getStorageSync("phone"),
			userId: uni.getStorageSync("userId"),
			medicineList: medicineList,
			payTag: payTag,
			reciveTel: address.reciveTel,
			reciveUser: address.reciveUsername,
			reciveAddress: address.reciveAddress,
		};
		console.log(params);
		const res = await createTradeInfo(params);
		console.log(res);
	} catch (error) {
		//TODO handle the exception
		console.log("新增交易记录error", error);
	} finally {
		uni.switchTab({
			url: "/pages/mine/mine",
		});
	}
};
</script>

<style scoped lang="scss">
.pages {
	position: relative;
}
.scroll-box {
	width: 100%;
	padding-bottom: 208rpx;
}
.address-box {
	width: 100%;
	height: 176rpx;
	background-color: $bg-card;
	padding: 32rpx 48rpx;
	@include flex-between;
	> :nth-child(1) {
		width: 56rpx;
		height: 56rpx;
		flex-shrink: 0;
		margin-right: 32rpx;
	}
	> :nth-child(2) {
		flex: 1;
		> :nth-child(1) {
			@include flex-start;
			> :nth-child(1) {
				margin-right: 16rpx;
				font-size: 32rpx;
				font-weight: bold;
				color: $text-primary;
			}
			> :nth-child(2) {
				font-size: 26rpx;
				color: $text-secondary;
			}
		}
		> :nth-child(2) {
			font-size: 24rpx;
			font-weight: bold;
			color: $text-primary;
		}
	}
	> :nth-child(3) {
		width: 24rpx;
		height: 24rpx;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
}

.idCard-box {
	margin-top: 24rpx;
	width: 100%;
	height: 310rpx;
	background-color: $bg-card;
	padding: 32rpx 48rpx;
	> :nth-child(1) {
		font-weight: 600;
		font-size: 28rpx;
		color: $text-primary;
	}
	> :nth-child(2) {
		margin-top: 24rpx;
		@include flex-between;
		> view {
			width: 314rpx;
			height: 184rpx;
			border-radius: 20rpx;
			overflow: hidden;
		}
	}
}
.medical-box {
	margin-top: 24rpx;
	width: 100%;
	// height: 324rpx;
	background-color: $bg-card;
	padding: 32rpx 48rpx;
	.title {
		font-weight: 600;
		font-size: 28rpx;
		color: $text-primary;
	}

	.divider-box {
		margin: 24rpx 0;
		width: 100%;
		height: 2rpx;
		background-color: $border-color;
	}
	.medical-info-box {
		margin-bottom: 24rpx;
		@include flex-start;
		.medical-info-pic {
			width: 174rpx;
			height: 174rpx;
			margin-right: 24rpx;
			flex-shrink: 0;
			border-radius: 20rpx;
			overflow: hidden;
		}
		.medical-info-detail {
			flex: 1;
			height: 100%;

			.medical-info-name {
				color: $text-regular;
				font-size: 24rpx;
			}
			.medical-info-price {
				@include flex-between;
				margin-top: 24rpx;
				> :nth-child(1) {
					@include flex-start;
					color: $danger;
					> :nth-child(1) {
						font-size: 20rpx;
					}
					> :nth-child(2) {
						font-size: 28rpx;
					}
				}
				> :nth-child(2) {
					color: $text-primary;
					font-size: 24rpx;
				}
			}
			.medical-info-tips {
				color: $text-secondary;
				font-size: 20rpx;
				margin-top: 8rpx;
			}
		}
	}
}
.order-summary {
	margin-top: 24rpx;
	width: 100%;
	background-color: $bg-card;
	padding: 32rpx 48rpx;
}
.summary-item {
	@include flex-between;
	margin: 32rpx 0;
}
.summary-label {
	color: $text-primary;
	font-size: 28rpx;
}
.summary-value {
	color: $text-regular;
	font-size: 28rpx;
}
.summary-payment {
	@include flex-start;
}
.summary-icon {
	width: 32rpx;
	height: 32rpx;
	overflow: hidden;
}
.summary-text {
	color: $text-regular;
	font-size: 28rpx;
}
.summary-divider {
	margin: 32rpx 0;
	width: 100%;
	height: 2rpx;
	background-color: $border-color;
}
.summary-total {
	@include flex-between;
}
.summary-total-price {
	color: $text-regular;
	font-size: 28rpx;
}
.bottom-box {
	@include flex-between;
	width: 100%;
	height: 200rpx;
	background-color: $bg-card;
	padding: 16rpx 48rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	.popup-total-price {
		@include flex-start;
		> :nth-child(1) {
			font-size: 24rpx;
			color: $text-regular;
			line-height: 1;
			margin-right: 16rpx;
		}
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
	.add-cart {
		width: 200rpx;
		height: 80rpx;
		background-color: $primary-light;
		color: $bg-card;
		@include flex-center;
		font-size: 28rpx;
		border-radius: 40rpx;
		font-weight: bold;
	}
}
</style>
