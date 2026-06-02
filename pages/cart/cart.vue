<template>
	<view class="page pages">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight * 2 + 'rpx', height: navTotalHeight + 'rpx' }">
			<view class="nav-content">
				<view class="nav-title">购物车</view>
				<view class="nav-right" @click="toggleManage">{{ isManage ? "退出管理" : "管理" }}</view>
			</view>
		</view>

		<!-- 列表区域 -->
		<scroll-view scroll-y="true" class="scroll-box">
			<view class="cart-item" v-for="item in cartList" :key="item.id">
				<view class="pharmacyName-box">
					<view class="">
						<up-checkbox
							name="agree"
							usedAlone
							:checked="item.check"
							@change="changeShop(item)"
							shape="circle"
							:disabled="currentWardId && currentWardId !== item.pharmacyId"
							activeColor="#459767"
						></up-checkbox>
					</view>
					<view class="">
						{{ item.pharmacyName }}
					</view>
				</view>
				<view class="goods-card" v-for="goods in item.medicines" @click="medicalDetail(goods)">
					<view class="goods-checkbox">
						<up-checkbox
							name="agree"
							usedAlone
							:checked="goods.check"
							shape="circle"
							activeColor="#459767"
							:disabled="currentWardId && currentWardId !== item.pharmacyId"
							@change="changeGoods(item, goods)"
						></up-checkbox>
					</view>
					<view class="medical-info">
						<view class="medical-pic">
							<image
								:src="goods.photo && goods.photo !== '-' ? goods.photo : '/static/images/medical.png'"
								class="img-box"
							></image>
						</view>

						<view class="medical-content">
							<view class="medical-header">
								<view class="medical-type" v-if="goods.classType == 0">處方藥</view>
								<view class="medical-name">{{ goods.name }}</view>
							</view>

							<view class="medical-footer">
								<view class="medical-price">
									<view class="">HK$</view>
									<view class="">{{ goods.unitPrice }}</view>
								</view>
								<view class="medical-num" @click.stop>
									<view
										class="minus-box"
										@click.stop="minus(goods)"
										:style="{ opacity: goods.shopNum <= 1 ? 0.4 : 1 }"
									>
										<up-icon name="minus" color="#a2a2a2" size="8"></up-icon>
									</view>
									<view class="input-num">
										<input type="number" :value="goods.shopNum" disabled class="input-number" />
									</view>
									<view class="plus-box" @click.stop="plus(goods)">
										<up-icon name="plus" color="#a2a2a2" size="8"></up-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="already-end" v-if="cartList.length != 0">已经到底了</view>
			<view v-if="cartList.length === 0" class="empty-tip">
				<view class="no-cart-box">
					<image src="/static/images/no_cart.png" mode="" class="img-box"></image>
				</view>
				<view class="">暂无内容</view>
			</view>
		</scroll-view>

		<!-- 底部提交栏 -->
		<view class="bottom-box">
			<view class="popup-total-price" v-if="!isManage">
				<view class="">合计</view>
				<view class="medical-price">
					<view class="">HK$</view>
					<view class="">{{ totalPrice }}</view>
				</view>
			</view>
			<view class="check-tip" v-else>
				<view class="">
					<up-checkbox
						name="agree"
						usedAlone
						:checked="cartList.length && cartList.every((shop) => shop.medicines.every((g) => g.check))"
						@change="changeDel(item)"
						shape="circle"
						activeColor="#459767"
					></up-checkbox>
					<view class="check-all">全选</view>
				</view>
				<view class="">已选中{{ selectedCount }}件药品</view>
			</view>
			<view class="btn-checkout-del" @click="deleteSelectedGoods" v-if="isManage">{{ "删除" }}</view>
			<view v-else class="btn-checkout" @click="checkout" :style="{ opacity: cartList.length > 0 ? 1 : 0.4 }">
				{{ "下单" }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getCartList, updataCartNum, updataCartCheck, deleteCart } from "@/api/base.js";
import { onShow, onLoad, onHide } from "@dcloudio/uni-app";

onShow(() => {
	getList();
});
onHide(() => {
	isManage.value = false;
});
// 状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;

// 导航栏内容高度设计图 88rpx
const navContentHeight = 88;
const navTotalHeight = statusBarHeight * 2 + navContentHeight;

const isManage = ref(false);
const toggleManage = () => {
	const isEntering = !isManage.value;

	if (isEntering && cartList.value.length === 0) {
		uni.showToast({
			title: "数据为空不可管理",
			icon: "none",
		});
		return;
	}

	isManage.value = !isManage.value;

	if (isEntering) {
		// 进入
		cartList.value.forEach((shop) => {
			shop.check = false;
			shop.medicines.forEach((goods) => {
				goods.check = false;
			});
		});
		currentWardId.value = null;
	} else {
		// 退出
		getList();
	}
};

const medicalDetail = (val) => {
	try {
		uni.navigateTo({
			url: `/pages/home/list/medicalDetail?id=${val.medicineId}`,
		});
	} catch (error) {
		//TODO handle the exception
	} finally {
	}
};

const changeGoods = async (shop, goods) => {
	// ===== 管理模式（只前端操作）=====
	if (isManage.value) {
		goods.check = !goods.check;
		shop.check = shop.medicines.every((g) => g.check);
		return;
	}
	try {
		uni.showLoading({
			mask: true,
			title: "",
		});
		// 如果当前未选择病房
		if (!currentWardId.value) {
			currentWardId.value = shop.pharmacyId;
		}

		// 如果选择不同病房
		if (currentWardId.value !== shop.pharmacyId) {
			uni.showToast({
				title: "不能选择不同病房的药品",
				icon: "none",
			});
			return;
		}

		const selTag = !goods.check ? "1" : "0";
		const idList = [goods.id];
		const params = {
			idList,
			selTag,
		};
		const res = await updataCartCheck(params);
		// 正常选择
		goods.check = !goods.check;

		// 更新店铺状态
		shop.check = shop.medicines.every((g) => g.check);

		// 如果全部取消选择
		checkResetWard();
	} catch (error) {
		//TODO handle the exception
	} finally {
		uni.hideLoading();
	}
};

const changeShop = async (shop) => {
	// ===== 管理模式（只前端操作）=====
	if (isManage.value) {
		shop.check = !shop.check;

		shop.medicines.forEach((g) => {
			g.check = shop.check;
		});

		return;
	}
	try {
		uni.showLoading({
			mask: true,
			title: "",
		});
		if (!currentWardId.value) {
			currentWardId.value = shop.pharmacyId;
		}

		if (currentWardId.value !== shop.pharmacyId) {
			uni.showToast({
				title: "不能选择不同病房的药品",
				icon: "none",
			});
			return;
		}

		const selTag = !shop.check ? "1" : "0";
		const idList = shop.medicines.map((s) => s.id);
		const params = {
			idList,
			selTag,
		};
		const res = await updataCartCheck(params);
		// return;
		shop.check = !shop.check;

		shop.medicines.forEach((g) => {
			g.check = shop.check;
		});

		checkResetWard();
	} catch (error) {
		//TODO handle the exception
	} finally {
		uni.hideLoading();
	}
};
// 取消限制
const checkResetWard = () => {
	const hasChecked = cartList.value.some((shop) => shop.medicines.some((goods) => goods.check));

	if (!hasChecked) {
		currentWardId.value = null;
	}
};
const selectedCount = computed(() => {
	if (!isManage.value) return 0;

	let count = 0;
	cartList.value.forEach((shop) => {
		shop.medicines.forEach((goods) => {
			if (goods.check) count++;
		});
	});
	return count;
});

const changeDel = () => {
	// 判断当前是否全选
	const allSelected = cartList.value.every((shop) => shop.medicines.every((goods) => goods.check));

	cartList.value.forEach((shop) => {
		shop.check = !allSelected;
		shop.medicines.forEach((goods) => {
			goods.check = !allSelected; // 如果已经全选 → 取消，否则全选
		});
	});
};

// 获取管理模式下选中的商品
const getSelectedGoods = () => {
	const selected = [];

	cartList.value.forEach((shop) => {
		shop.medicines.forEach((goods) => {
			if (goods.check) {
				selected.push(goods);
			}
		});
	});

	return selected;
};

const deleteSelectedGoods = async () => {
	const selected = getSelectedGoods();

	if (!selected.length) {
		uni.showToast({
			title: "请先选择要删除的商品",
			icon: "none",
		});
		return;
	}

	uni.showModal({
		title: "删除确认",
		content: `您确定要删除 ${selected.length} 件商品吗？`,
		success: async (res) => {
			if (res.confirm) {
				try {
					const ids = selected.map((g) => g.id);
					const params = {
						idList: ids,
						shopTag: "2",
					};
					await deleteCart(params); // 调用删除接口
					uni.showToast({ title: "删除成功", icon: "success" });
					getList(); // 刷新列表
				} catch (error) {
					console.error("删除失败", error);
					uni.showToast({
						title: "删除失败，请重试",
						icon: "none",
					});
				} finally {
				}
			}
		},
	});
};
// 模拟购物车数据
const cartList = ref([]);

const getList = async () => {
	try {
		const res = await getCartList({ userId: uni.getStorageSync("userId") });
		cartList.value = res.data.data || [];

		let wardId = null; // 临时记录

		cartList.value.forEach((item) => {
			// 商品选中状态
			item.medicines.forEach((goods) => {
				goods.check = goods.selTag == 1;

				// 如果有选中的商品，记录它的 pharmacyId
				if (goods.check && !wardId) {
					wardId = item.pharmacyId;
				}
				// 如果已经有病房ID，并且当前商品是其他病房的选中商品 → 自动取消
				if (wardId && wardId !== item.pharmacyId && goods.check) {
					goods.check = false;
				}
			});

			// 店铺选中状态
			item.check = item.medicines.every((goods) => goods.check);
		});

		// 同步当前病房ID
		currentWardId.value = wardId;
	} catch (error) {
		console.log(error);
	}
};
// 限制不能选中不同的病房
const currentWardId = ref(null);
// 删除商品
const removeItem = (id) => {
	cartList.value = cartList.value.filter((item) => item.id !== id);
};

const minus = async (val) => {
	try {
		const shopNum = val.shopNum - 1;
		if (shopNum == 0) {
			uni.showToast({
				title: "药品数量不能为0",
				icon: "none",
				mask: true,
			});
			return;
		}
		uni.showLoading({
			title: "",
			mask: true,
		});
		const params = {
			idList: [val.id],
			shopNum,
		};

		const res = await updataCartNum(params);
		getList();
	} catch (error) {
	} finally {
		uni.hideLoading();
	}
};

const plus = async (val) => {
	try {
		const shopNum = val.shopNum + 1;
		uni.showLoading({
			title: "",
			mask: true,
		});
		const params = {
			idList: [val.id],
			shopNum,
		};
		const res = await updataCartNum(params);
		getList();
	} catch (error) {
	} finally {
		uni.hideLoading();
	}
};
// 计算总价
const totalPrice = computed(() => {
	let total = 0;

	cartList.value.forEach((shop) => {
		shop.medicines.forEach((goods) => {
			if (goods.check) {
				total += goods.unitPrice * goods.shopNum;
			}
		});
	});

	return total.toFixed(2);
});

const getSelectedGoodsData = () => {
	if (isManage.value) return [];

	return cartList.value.flatMap((shop) => shop.medicines.filter((goods) => goods.check));
};
const checkout = () => {
	if (isManage.value) return;

	const selectedGoods = getSelectedGoodsData();

	// ❌ 什么都没选
	if (!selectedGoods.length) {
		uni.showToast({
			title: "请选择需要购买的药品",
			icon: "none",
		});
		return;
	}

	// ✅ 是否包含处方药
	const hasRx = selectedGoods.some((g) => g.classType == 0);
	// 👉 提取商品id（后面都要用）
	const ids = selectedGoods.map((g) => g.medicineId);
	// ===============================
	// 🧠 核心分流逻辑
	// ===============================

	if (hasRx) {
		// 👉 处方药（包含混合情况）
		uni.navigateTo({
			url: `/pages/home/list/goDoctor?ids=${ids}`,
		});
	} else {
		// 👉 全是非处方药
		uni.navigateTo({
			url: `/pages/cart/confirm?ids=${ids}&type=${"cart"}`,
		});
	}
};
</script>

<style lang="scss" scoped>
.pages {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* 自定义导航栏 */
.nav-bar {
	width: 100%;
	background-color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: flex-end; /* 内容在状态栏下方 */
	z-index: 10;
	box-sizing: border-box;
}

.nav-content {
	height: 88rpx; /* 设计图导航栏内容高度 */
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
}

.nav-left,
.nav-right {
	font-size: 28rpx;
	color: $text-regular;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-primary;
}

/* 列表区域 */
.scroll-box {
	flex: 1;
	box-sizing: border-box;
	height: 0;
	// overflow: hidden;
}

.cart-item {
	background-color: #fff;
	padding: 24rpx 48rpx;
	margin-bottom: 24rpx;
}

.item-left {
	margin-right: 20rpx;
}

.item-center {
	flex: 1;
}

.item-name {
	font-size: 28rpx;
	color: #333;
}

.item-price {
	font-size: 24rpx;
	color: $danger;
	margin-top: 10rpx;
}

.item-right button {
	background-color: $danger;
	color: #fff;
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
}
.pharmacyName-box {
	@include flex-start;
	border-bottom: 1px solid $border-color;
	padding-bottom: 24rpx;
	margin-bottom: 24rpx;
	> :nth-child(2) {
		font-weight: 600;
		font-size: 28rpx;
		color: $text-primary;
	}
}

.goods-card {
	@include flex-start;
	width: 100%;
	height: 176rpx;
	padding: 24rpx 0;
	margin-bottom: 16rpx;
	align-items: stretch;
}
.goods-checkbox {
	display: flex;
	align-items: center; // checkbox 垂直居中
	margin-right: 16rpx;
}
.medical-info {
	flex: 1;
	@include flex-start;
	padding: 8rpx 0;
}
.medical-pic {
	width: 128rpx;
	height: 128rpx;
	border-radius: 20rpx;
	margin-right: 16rpx;
	> :nth-child(1) {
		border-radius: 20rpx;
	}
}
.medical-content {
	flex: 1;
	height: 100%;
	@include flex-col-between-start;
}
.medical-header {
	@include flex-start;
}
.medical-name {
	color: $text-regular;
	font-size: 24rpx;
}
.medical-footer {
	width: 100%;
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

.medical-num {
	@include flex-start;
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
.medical-type {
	border-radius: 10rpx;
	width: 72rpx;
	height: 30rpx;
	background-color: $mark;
	color: $bg-card;
	font-size: 20rpx;
	margin-right: 8rpx;
	flex-shrink: 0;
	@include flex-center;
}

.already-end {
	width: 100%;
	height: 80rpx;
	@include flex-center;
	color: $text-secondary;
	font-size: 20rpx;
}
/* 空提示 */
.empty-tip {
	width: 100%;
	height: 100%;
	@include flex-col-center;
	gap: 16rpx;
	color: $text-secondary;
	font-size: 20rpx;
}
.no-cart-box {
	width: 160rpx;
	height: 160rpx;
}
/* 底部提交栏 */
.bottom-box {
	width: 100%;
	height: 96rpx;
	background-color: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 48rpx;
	box-shadow: $box-shadow;
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
.total {
	font-size: 28rpx;
	color: $text-regular;
}
.check-tip {
	color: $text-secondary;
	font-size: 24rpx;
	@include flex-start;
	margin-right: 16rpx;
	> :nth-child(1) {
		@include flex-start;
		margin-right: 16rpx;
	}
}

.btn-checkout {
	width: 160rpx;
	height: 64rpx;
	background-color: $primary;
	color: #fff;
	font-size: 28rpx;
	border-radius: 20rpx;
	font-weight: 600;
	display: flex;
	justify-content: center;
	align-items: center;
}
.btn-checkout-del {
	width: 160rpx;
	height: 64rpx;
	background-color: $danger;
	color: #fff;
	font-size: 28rpx;
	border-radius: 20rpx;
	font-weight: 600;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
