<template>
	<view class="order-detail">
		<!-- 訂單狀態區域 -->
		<view class="status-section">
			<view style="display: flex; justify-content: space-between">
				<text class="status-title">{{ statusText }}</text>
				<text v-if="orderInfo.tradeStatus === '3'" @click="showDetailModalS" style="font-size: 24rpx; color: #434343">詳細信息></text>
			</view>
			<view class="status-tip" v-if="orderInfo.status === 'pending'">
				<text class="tip-icon">⏱</text>
				<text class="tip-text">有效期7天，如未支付，訂單將自動取消</text>
			</view>
		</view>

		<!-- 收貨地址 -->
		<view class="address-section">
			<text class="address-label">送至</text>
			<view class="address-content">
				<text class="address-text">{{ orderInfo.reciveAddress || '選擇地址' }}</text>
				<text class="address-edit" v-if="orderInfo.tradeStatus === '0'" @click="editAddress">修改 ></text>
			</view>
		</view>

		<!-- 個人身份信息 -->
		<view class="identity-section" v-if="orderInfo.tradeStatus === '0'" @click="openIdentityModal">
			<view class="identity-left">
				<text class="identity-title">请选择个人身份信息</text>
				<view class="identity-info">
					<view class="identity-icon-wrap">
						<image class="identity-icon" src="/static/img/37.png" mode="aspectFit"></image>
					</view>
					<text class="identity-desc">
						<span style="color: red">*</span>
						根据海关要求，跨境交易需提供真实身份信息，收货人姓名需要与实名信息一致，否则可能造成清关失败。
					</text>
				</view>
			</view>
			<text class="identity-arrow">></text>
		</view>

		<!-- 跨境物流协议弹框 -->
		<view v-if="identityModalVisible" class="identity-modal-overlay" @click="closeIdentityModal">
			<view class="identity-modal" @click.stop>
				<view class="identity-modal-header">
					<text class="identity-modal-title">跨境物流协议</text>
				</view>
				<scroll-view class="identity-modal-scroll" scroll-y="true">
					<image class="protocol-image" src="/static/img/36.png" mode="widthFix"></image>
				</scroll-view>
				<view class="identity-modal-bottom">
					<view class="identity-confirm-btn" @click="confirmIdentity">确认</view>
				</view>
			</view>
		</view>

		<!-- 操作按鈕區域 -->
		<view class="action-section">
			<!-- 待付款狀態 -->
			<template v-if="orderInfo.tradeStatus === '0'">
				<view class="pay-btn" @click="open">立即支付</view>
				<text class="cancel-text" @click="handleCancel(orderInfo)">取消訂單</text>
			</template>
			<!-- 待收貨狀態 -->
			<template v-else-if="orderInfo.tradeStatus === '3'">
				<view class="pay-btn" @click="openShowTip(orderInfo)">確認收貨</view>
			</template>
			<template v-else-if="orderInfo.tradeStatus === '1'">
				<text class="cancel-text" @click="handleRefund">申請退款</text>
			</template>
			<template v-else-if="orderInfo.tradeStatus === '2'">
				<text class="cancel-text" @click="handleRefund">申請退款</text>
			</template>
		</view>
		<!-- 商品列表 -->
		<view class="goods-section">
			<view class="shop-name">
				{{ orderInfo.tradeMedicineList?.[0]?.pharmacyName || '' }}
			</view>
			<view class="goods-list">
				<view class="goods-item" v-for="(item, index) in orderInfo.tradeMedicineList || []" :key="item.medicineId || index">
					<image class="goods-img" :src="item.photo || '/static/img/34.png'" lazy-load></image>
					<view class="goods-info">
						<text class="goods-name">{{ item.name }}</text>
						<text class="goods-count">x{{ item.medicineCun || 1 }}</text>
					</view>
					<view class="goods-price-wrap">
						<text class="goods-price">HK${{ item.price }}</text>
						<text class="goods-status">{{ item.statusText || '支付' }}</text>
					</view>
				</view>
			</view>
			<!-- 展開/收起 -->
			<view class="expand-btn" v-if="orderInfo.goodsList && orderInfo.goodsList.length > 3" @click="toggleExpand">
				<text>{{ isExpanded ? '收起' : `展開(共${orderInfo.goodsList.length}件)` }}</text>
				<text class="expand-icon">{{ isExpanded ? '∧' : '∨' }}</text>
			</view>
			<!-- 實付款 -->
			<view 
				class="total-section" 
				v-if="String(orderInfo.tradeStatus) !== '0'"
			>
				<text class="total-label">實付款</text>
				<text class="total-price">HK${{ orderInfo.tradeFee }}</text>
			</view>
		</view>
		<!-- 訂單信息 -->
		<view class="info-section">
			<view class="info-item">
				<text class="info-label">交易時間</text>
				<text class="info-value">{{ orderInfo.tradeTime }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">有效起始時間</text>
				<text class="info-value">{{ orderInfo.effectiveStartTime }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">有效終止時間</text>
				<text class="info-value">{{ orderInfo.effectiveEndTime }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">交易類型</text>
				<text class="info-value">
					{{ orderInfo.tradeType === '0' ? '處方購藥' : '非處方購藥' }}
				</text>
			</view>
			<view class="info-item">
				<text class="info-label">交易狀態</text>
				<text class="info-value">{{ statusText }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">支付方式</text>
				<text class="info-value">支付寶</text>
			</view>
		</view>

		<!-- 詳細信息彈窗 - 待發貨 (狀態2) -->
		<view v-if="detailModalVisible && currentDetailStatus === 2" class="detail-modal-overlay" @click="closeDetailModal">
			<view class="detail-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">詳細信息</text>
					<text class="modal-close" @click="closeDetailModal">✕</text>
				</view>
				<view class="modal-content">
					<!-- 待發貨狀態 -->
					<view class="timeline-item">
						<view class="timeline-dot grey"></view>
						<view class="timeline-text">
							<text class="timeline-label">[收貨地址]</text>
							<text class="timeline-detail">{{ orderInfo.reciveAddress || '未填寫地址' }}</text>
						</view>
					</view>
					<view class="timeline-item">
						<view class="timeline-dot green"></view>
						<view class="timeline-text">
							<text class="timeline-label">已發貨待收貨</text>
							<text class="timeline-detail">等待藥房發貨</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 詳細信息彈窗 - 已發貨 (狀態3) -->
	</view>
	<up-popup v-model:show="show" closeable>
		<view class="popup-box">
			<view class="popup-title">支付費用明細</view>

			<view class="fee-container">
				<view class="fee-desc">您需支付以下費用：</view>

				<view class="fee-item">
					<view class="fee-label">藥品費用</view>
					<view class="fee-value">HK${{ orderInfo.medicineFee }}</view>
				</view>

				<view class="fee-item">
					<view class="fee-label">跨境物流</view>
					<view class="fee-value">HK${{ orderInfo.logisticsFee }}</view>
				</view>
				<view class="fee-item">
					<view class="fee-label">行政費用（含税）</view>
					<view class="fee-value">HK${{ totalCustomDuty }}</view>
				</view>
				<!-- <view class="fee-item">
					<view class="fee-label">預計關税</view>
					<view class="fee-value">HK$22/￥20</view>
				</view> -->
				<!-- <view class="fee-item tax-item">
					<view class="tax-title">行郵税</view>
				
					<view
						class="tax-row"
						v-for="(item, index) in orderInfo.tradeMedicineList"
						:key="index"
					>
						<view class="tax-name">
							{{ item.name }}
						</view>
				
						<view class="tax-info">
							<text>税率：{{ item.taxRate || 0 }}%</text>
							<text>税费：HK$ {{ item.customDuty || 0 }}</text>
						</view>
					</view>
				</view> -->

				<view class="fee-item total">
					<view class="fee-label">合計</view>
					<view class="fee-value">HK${{ orderInfo.tradeFee }}</view>
				</view>

				<view class="fee-note">注：實際關税以海關最終核定為準，多退少不補</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="close">取消</view>
			<view class="popup-btn" @click="submit">確定</view>
		</view>
	</up-popup>
	<up-popup v-model:show="showTip" closeable>
		<view class="popup-box">
			<view class="popup-title">藥品簽收確認</view>
			<view class="popup-text">
				<view>請在簽收前確認：</view>
				<view>1. 包裝完好，無破損、滲漏。</view>
				<view>2. 藥品名稱、規格、數量與訂單一致。</view>
				<view>3. 藥品在有效期內。</view>
				<view>如發現問題，請拒收並立即聯繫客服。</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="closeShowTip">取消</view>
			<view class="popup-btn" @click="submitShowTip">確定</view>
		</view>
	</up-popup>
</template>
<script setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { jumpToNextPage } from '@/utils/jumpTo.js';
import { updexpenditure, getreciveaddress } from '@/api/yyf.js';
import { showToast } from '../../../utils/feedback';
import { AliPay } from '@/api/base.js';
// 訂單信息
const orderInfo = ref({});

// 是否展開商品列表
const isExpanded = ref(false);

// 詳細信息彈窗
const detailModalVisible = ref(false);
const currentDetailStatus = ref(null);
const totalCustomDuty = computed(() => {
	return (orderInfo.value.tradeMedicineList || []).reduce((total, item) => {
		return total + Number(item.customDuty || 0);
	}, 0);
});
// 狀態文字
const statusText = computed(() => {
	const statusMap = {
		0: '待付款',
		1: '已付款待配藥',
		2: '已配藥待發貨',
		3: '已發貨待收貨',
		4: '已收貨',
		5: '交易取消'
	};
	return statusMap[orderInfo.value.tradeStatus] || '未知狀態';
});

// 顯示的商品列表
const displayGoodsList = computed(() => {
	if (isExpanded.value || !orderInfo.value.goodsList) {
		return orderInfo.value.goodsList;
	}
	return orderInfo.value.goodsList.slice(0, 3);
});
const addressList = ref([]);
const getlist = async () => {
	const res = await getreciveaddress({
		reciveTel: uni.getStorageSync('phone')
	});
	console.log(res);
	if (res.code === '200') {
		addressList.value = res.data.data || [];
		console.log(addressList.value);
		// 如果orderInfo沒有地址，則設置默認地址
		if (!orderInfo.value.reciveAddress) {
			const defaultAddress = addressList.value.find((item) => item.defaultTag === '1');
			if (defaultAddress) {
				orderInfo.value.reciveAddress = defaultAddress.reciveAddress;
			}
		}
	}
};

// 頁面加載
onLoad((options) => {
	getlist();
	if (options.detail) {
		try {
			const data = JSON.parse(decodeURIComponent(options.detail));
			console.log(data);
			orderInfo.value = data;
			// 如果有medicineList則使用真實數據
			if (data.medicineList && data.medicineList.length > 0) {
				goodsList.value = data.medicineList;
			}
		} catch (e) {
			console.error('解析訂單數據失敗', e);
		}
	}
});

// 監聽從地址管理頁面返回時選擇的地址
onShow(() => {
	const selectedAddress = uni.getStorageSync('selectedAddress');
	if (selectedAddress) {
		orderInfo.value.reciveAddress = selectedAddress.reciveAddress;
		// 使用後清除緩存
		uni.removeStorageSync('selectedAddress');
	}
});

// 獲取訂單詳情
const getOrderDetail = async (id) => {
	// TODO: 調用接口獲取訂單詳情
	// const res = await getOrderDetailApi(id)
	// orderInfo.value = res.data
};

// 展開/收起商品列表
const toggleExpand = () => {
	isExpanded.value = !isExpanded.value;
};

// 顯示詳細信息彈窗
const showDetailModal = (status) => {
	currentDetailStatus.value = status;
	detailModalVisible.value = true;
};

// 關閉詳細信息彈窗
const closeDetailModal = () => {
	detailModalVisible.value = false;
	currentDetailStatus.value = null;
};
const showDetailModalS = () => {
	uni.navigateTo({
		url: '/pages/mine/Record/logistics'
	});
};
// 複製快遞單號
const copyExpressNumber = () => {
	uni.setClipboardData({
		data: orderInfo.value.expressNumber || '43248509778484422',
		success: () => {
			uni.showToast({
				title: '已複製',
				icon: 'success'
			});
		}
	});
};

// 修改地址
const editAddress = () => {
	jumpToNextPage('/pages/mine/minelist/addressManage?from=recordDetail');
};

// 立即支付
const handlePay = async () => {
	console.log(orderInfo.value.reciveAddress);
	if (orderInfo.value.reciveAddress == null) {
		showToast('請先選擇地址');
		return;
	}
	var EnvUtils = plus.android.importClass('com.alipay.sdk.app.EnvUtils');
	EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);
	try {
		const params = { orderNo: '4545', payFee: (orderInfo.value.tradeFee * 1).toFixed(2) };
		const res = await AliPay(params);
		console.log(res);
		if (res.code == 200) {
			const payData = res.data;
			uni.requestPayment({
				provider: 'alipay',
				orderInfo: payData, // 後端返回的 orderString

				success: async (payRes) => {
					console.log('支付回調:', payRes);

					uni.showLoading({
						title: '處理中...'
					});

					try {
						const praes = {
							chargeId: payRes.tradeno,
							tradeStatus: '1',
							reciveTel: uni.getStorageSync('phone'),
							reciveUser: uni.getStorageSync('userName'),
							userId: uni.getStorageSync('userId'),
							reciveAddress: orderInfo.value.reciveAddress,
							payTag: '1',
							tradeId: orderInfo.value.tradeId,
							tradeFee: orderInfo.value.tradeFee
						};
						console.log(praes);
						const orderRes = await updexpenditure(praes);
						console.log('訂單創建成功:', orderRes);
						uni.hideLoading();

						uni.showToast({
							title: '支付成功',
							icon: 'success'
						});
						uni.navigateBack();
					} catch (error) {
						uni.hideLoading();

						console.error('訂單創建失敗:', error);

						uni.showToast({
							title: '訂單生成失敗',
							icon: 'none'
						});
					}
				},

				fail: (err) => {
					console.log('支付失敗', err);

					// 用户取消支付要單獨判斷
					if (err.errMsg.includes('cancel')) {
						uni.showToast({
							title: '已取消支付',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: '支付失敗',
							icon: 'none'
						});
					}
				}
			});
		}
	} catch (error) {
		console.log(error);
		//TODO handle the exception
	} finally {
		uni.hideLoading();
		close();
	}
	// uni.showModal({
	// 	title: '提示',
	// 	content: '是否前往支付？',
	// 	confirmText: '去支付',
	// 	cancelText: '取消',
	// 	success: (res) => {
	// 		if (res.confirm) {
	// 			// 點擊確認
	// 			console.log('用户點擊支付');
	// 			// TODO: 調用支付接口

	// 		} else if (res.cancel) {
	// 			console.log('用户取消');
	// 		}
	// 	}
	// });
};

// 取消訂單
const handleCancel = (item) => {
	uni.showModal({
		title: '提示',
		content: '確定要取消該訂單嗎？',
		success: async (res) => {
			if (res.confirm) {
				try {
					const result = await updexpenditure({
						tradeId: item.tradeId,
						tradeStatus: '5'
					});

					if (result.data.code === '1000') {
						uni.showToast({
							title: '取消成功',
							icon: 'success'
						});

						// ✅ 刷新列表（很關鍵）
						uni.navigateTo({
							url: '/pages/mine/Record/index'
						});
					} else {
						uni.showToast({
							title: result.data.msg || '取消失敗',
							icon: 'none'
						});
					}
				} catch (e) {
					console.log(e);
					uni.showToast({
						title: '請求失敗',
						icon: 'none'
					});
				}
			}
		}
	});
};

// 確認收貨

const currentOrderInfo = ref({});
const showTip = ref(false);
const openShowTip = (item) => {
	showTip.value = true;
	currentOrderInfo.value = item;
};
const closeShowTip = () => {
	showTip.value = false;
};
const submitShowTip = () => {
	const item = currentOrderInfo.value;
	handleConfirmReceive(item);
};
const handleConfirmReceive = async (item) => {
	try {
		const result = await updexpenditure({
			tradeId: item.tradeId,
			tradeStatus: '4'
		});

		if (result.data.code === '1000') {
			uni.showToast({
				title: '已確認收貨',
				icon: 'success'
			});

			// ✅ 刷新列表（很關鍵）
			uni.navigateBack();
			// uni.navigateTo({
			// 	url: "/pages/mine/Record/index",
			// });
		} else {
			uni.showToast({
				title: result.data.msg || '確認失敗',
				icon: 'none'
			});
		}
	} catch (e) {
		console.log(e);
		uni.showToast({
			title: '請求失敗',
			icon: 'none'
		});
	} finally {
		closeShowTip();
	}
};
// 退款
const handleRefund = () => {
	uni.showModal({
		title: '退款提示',
		content: '您確定退款嗎？',
		confirmText: '確定退款',
		cancelText: '再想想',
		success: (res) => {
			if (res.confirm) {
				uni.navigateTo({
					url: '/pages/mine/refund/index'
				});
			}
		}
	});
};

// 跨境物流協議彈框
const identityModalVisible = ref(false);
const openIdentityModal = () => {
	identityModalVisible.value = true;
};
const closeIdentityModal = () => {
	identityModalVisible.value = false;
};
const confirmIdentity = () => {
	identityModalVisible.value = false;
	uni.navigateTo({
		url: '/pages/mine/hg'
	});
};

const show = ref(false);

const open = () => {
	const hgrz = uni.getStorageSync('hgrz');
	if (hgrz != 'hgrz') {
		showToast('請先選擇個人身份信息');
		return;
	}
	if (orderInfo.value.reciveAddress == null) {
		showToast('請先選擇地址');
		return;
	}
	show.value = true;
};

const close = () => {
	show.value = false;
};

const submit = async () => {
	handlePay();
};
</script>

<style scoped lang="scss">
.order-detail {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 30rpx;
}

// 狀態區域
.status-section {
	background-color: #fff;
	padding: 40rpx 32rpx;

	.status-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.status-tip {
		display: flex;
		align-items: center;
		margin-top: 20rpx;

		.tip-icon {
			font-size: 28rpx;
			margin-right: 10rpx;
		}

		.tip-text {
			font-size: 26rpx;
			color: #666;
		}
	}
}

// 地址區域
.address-section {
	background-color: #fff;
	padding: 32rpx;
	margin-top: 2rpx;
	display: flex;
	align-items: flex-start;

	.address-label {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.address-content {
		flex: 1;
		display: flex;
		align-items: flex-start;

		.address-text {
			flex: 1;
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
		}

		.address-edit {
			font-size: 26rpx;
			color: #999;
			flex-shrink: 0;
			margin-left: 20rpx;
		}
	}
}

// 個人身份信息區域
.identity-section {
	background-color: #fff;
	padding: 28rpx 32rpx;
	margin-top: 2rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;

	.identity-left {
		.identity-icon-wrap {
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			background-color: #f0f0f0;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			margin-right: 20rpx;
			margin-top: 20rpx;
			overflow: hidden;

			.identity-icon {
				width: 72rpx;
				height: 72rpx;
			}
		}

		.identity-info {
			display: flex;

			.identity-desc {
				font-size: 22rpx;
				color: #999;
				line-height: 1.5;
				display: block;
			}
		}
	}

	.identity-arrow {
		font-size: 28rpx;
		color: #999;
		flex-shrink: 0;
		margin-left: 16rpx;
	}
}

.identity-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

// 跨境物流協議彈框
.identity-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	justify-content: center;
	z-index: 1000;
}

.identity-modal {
	width: 100%;
	max-height: 85vh;
	background-color: #fff;
	border-radius: 32rpx 32rpx 0 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	.identity-modal-header {
		padding: 36rpx 32rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1rpx solid #f0f0f0;

		.identity-modal-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.identity-modal-scroll {
		flex: 1;
		max-height: 65vh;
		padding: 0 32rpx;

		.protocol-image {
			width: 700rpx;
			display: block;
		}
	}

	.identity-modal-bottom {
		padding: 24rpx 48rpx 48rpx;
		border-top: 1rpx solid #f0f0f0;

		.identity-confirm-btn {
			width: 100%;
			height: 88rpx;
			background-color: #52ae7b;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			color: #fff;
			font-weight: bold;
		}
	}
}

// 操作按鈕區域
.action-section {
	background-color: #fff;
	padding: 32rpx;
	margin-top: 2rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.pay-btn {
		width: 100%;
		height: 88rpx;
		background-color: #52ae7b;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
	}

	.cancel-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #666;
	}
}

// 商品列表區域
.goods-section {
	background-color: #fff;
	margin-top: 20rpx;
	padding: 32rpx;

	.shop-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 24rpx;
	}

	.goods-list {
		.goods-item {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.goods-img {
				width: 120rpx;
				height: 120rpx;
				border-radius: 8rpx;
				flex-shrink: 0;
			}

			.goods-info {
				flex: 1;
				margin-left: 20rpx;

				.goods-name {
					font-size: 26rpx;
					color: #333;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.goods-count {
					font-size: 24rpx;
					color: #999;
					margin-top: 10rpx;
				}
			}

			.goods-price-wrap {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				margin-left: 20rpx;

				.goods-price {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}

				.goods-status {
					font-size: 24rpx;
					color: #999;
					margin-top: 10rpx;
				}
			}
		}
	}

	.expand-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		font-size: 26rpx;
		color: #999;

		.expand-icon {
			margin-left: 10rpx;
		}
	}

	.total-section {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-top: 24rpx;
		border-top: 1rpx solid #f5f5f5;

		.total-label {
			font-size: 28rpx;
			color: #333;
			margin-right: 20rpx;
		}

		.total-price {
			font-size: 36rpx;
			color: #333;
			font-weight: bold;
		}
	}
}

// 訂單信息區域
.info-section {
	background-color: #fff;
	margin-top: 20rpx;
	padding: 32rpx;

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 0;

		.info-label {
			font-size: 28rpx;
			color: #999;
		}

		.info-value {
			font-size: 28rpx;
			color: #333;
		}
	}
}

// 詳細信息彈窗
.detail-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 999;
}

.detail-modal {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	animation: slideUp 0.3s ease-out;

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 1rpx solid #f5f5f5;

		.modal-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.modal-close {
			font-size: 36rpx;
			color: #999;
		}
	}

	.modal-content {
		padding: 32rpx;
		max-height: 60vh;
		overflow-y: auto;
	}
}

// 快遞信息
.express-info {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background-color: #fef9e7;
	border-radius: 12rpx;
	margin-bottom: 32rpx;

	.express-icon {
		font-size: 48rpx;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.express-details {
		flex: 1;
		display: flex;
		flex-direction: column;

		.express-name {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}

		.express-number {
			font-size: 24rpx;
			color: #666;
			margin-top: 8rpx;
		}
	}

	.express-copy {
		font-size: 24rpx;
		color: #666;
		padding: 8rpx 16rpx;
		flex-shrink: 0;
	}
}

// 時間軸
.timeline {
	.timeline-item {
		display: flex;
		margin-bottom: 32rpx;
	}
}

// 時間軸項目（適用於所有區域）
.timeline-item {
	display: flex;
	margin-bottom: 32rpx;

	.timeline-dot {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		flex-shrink: 0;
		margin-right: 20rpx;
		margin-top: 2rpx;

		&.grey {
			background-color: #d0d0d0;
		}

		&.green {
			background-color: #52ae7b;
		}
	}

	.timeline-text {
		flex: 1;

		.timeline-label {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			display: block;
		}

		.timeline-time {
			font-size: 24rpx;
			color: #999;
			display: block;
			margin-top: 8rpx;
		}

		.timeline-detail {
			font-size: 26rpx;
			color: #666;
			display: block;
			margin-top: 8rpx;
			line-height: 1.5;
		}
	}
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}

	to {
		transform: translateY(0);
	}
}

.popup-box {
	box-sizing: border-box;
	height: fit-content;
	padding: 32rpx 48rpx;
}

.popup-title {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	@include flex-center;
}

.popup-text {
	margin-top: 32rpx;
	font-weight: 400;
	font-size: 28rpx;
	color: $text-secondary;
}

.fee-container {
	margin-top: 40rpx;

	.fee-desc {
		font-weight: 400;
		font-size: 28rpx;
		color: #434343;
	}

	.fee-item {
		@include flex-between;
		margin-top: 32rpx;

		.fee-label {
			font-weight: 400;
			font-size: 24rpx;
			color: #a2a2a2;
		}

		.fee-value {
			font-weight: 400;
			font-size: 28rpx;
			color: #ff4c10;
		}
	}

	.fee-item.total {
		@include flex-start;

		.fee-label {
			font-weight: 600;
			font-size: 24rpx;
			color: #181b19;
			margin-right: 24rpx;
		}

		.fee-value {
			font-weight: 400;
			font-size: 28rpx;
			color: #ff4c10;
		}
	}

	.fee-note {
		margin-top: 32rpx;
		font-weight: 400;
		font-size: 24rpx;
		color: #434343;
	}
}

.popup-bottom {
	margin-top: 0rpx;
	width: 100%;
	height: 200rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
	@include flex-between;
	gap: 24rpx;
}

.popup-btn {
	width: 50%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($bg-card, 1);
	font-weight: 600;
	font-size: 28rpx;
}

.popup-btn-cancel {
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
/* 行邮税 */
.tax-item {
	display: block !important;
}

.tax-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.tax-row {
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.tax-name {
	font-size: 26rpx;
	color: #333;
	line-height: 1.6;
}

.tax-info {
	margin-top: 10rpx;
	display: flex;
	justify-content: space-between;
	font-size: 24rpx;
	color: #999;
}
</style>
