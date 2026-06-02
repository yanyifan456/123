<template>
	<view class="detail-container">
		<!-- 顶部状态和详情链接 -->
		<view class="top-bar">
			<view style="display: flex;justify-content: space-between;">
				<text class="status-text">{{ aa.status }}</text>
				<text v-if="aa.status !== '审核通过'" class="detail-link" @click="showDetailModal = true">退款详情 ></text>
			</view>
			<view style="margin-top: 30rpx;margin:0  auto;" v-if="aa.status === '审核中'" class="cancel-refund-btn" @click="cancelRefund">取消退款</view>
		</view>

		<!-- 药房和药品列表 -->
		<view class="medicine-section">
			<text class="pharmacy-header">{{ aa.pharmacyName }}</text>

			<!-- 药品项 -->
			<view v-for="(item, index) in refundInfo.medicines" :key="index" class="medicine-item">
				<image :src="item.image" class="medicine-image" />
				<view class="medicine-info">
					<text class="medicine-name">{{ item.name }}</text>
					<text class="medicine-desc">{{ item.description }}</text>
					<text class="medicine-count">×1</text>
				</view>
				<view class="medicine-price">
					<text class="price-value">HK${{ item.price }}</text>
					<text class="price-unit">实付</text>
				</view>
			</view>

			<!-- 合计 -->
			<view class="total-section">
				
				<view class="total-row">
					<text class="total-text">实付款</text>
					<text class="total-price">HK${{ aa.totalPrice }}</text>
				</view>
			</view>
			<view class="order-info-section">
				<view class="info-item">
					<text class="info-key">交易日期</text>
					<text class="info-val">{{ refundInfo.tradeDate }}</text>
				</view>
				<view class="info-item">
					<text class="info-key">支付日期</text>
					<text class="info-val">{{ refundInfo.payDate }}</text>
				</view>
				<view class="info-item">
					<text class="info-key">配送时间</text>
					<text class="info-val">{{ refundInfo.deliveryDate }}</text>
				</view>
				<view class="info-item">
					<text class="info-key">交易类型</text>
					<text class="info-val">{{ refundInfo.tradeType }}</text>
				</view>
				<view class="info-item">
					<text class="info-key">交易状态</text>
					<text class="info-val">{{ refundInfo.tradeStatus }}</text>
				</view>
				<view class="info-item">
					<text class="info-key">支付方式</text>
					<text class="info-val">{{ refundInfo.payMethod }}</text>
				</view>
			</view>
		</view>

		<!-- 订单信息 -->
		
	</view>

	<!-- 退款详情弹窗 -->
	<view v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">退款详情</text>
				<text class="modal-close" @click="showDetailModal = false">✕</text>
			</view>

			<!-- 时间轴 -->
			<view class="timeline">
				<!-- 提交申请 -->
				<view class="timeline-item">
					<view class="timeline-dot completed"></view>
					<view class="timeline-content">
						<text class="timeline-step">提交申请</text>
					</view>
				</view>

				<!-- 平台审核 -->
				<view class="timeline-item">
					<view class="timeline-dot" :class="aa.status === '审核中' ? 'completed' : aa.status === '审核驳回' ? 'rejected' : 'completed'"></view>
					<view class="timeline-content">
						<text class="timeline-step">平台审核</text>
						<view v-if="aa.status === '审核驳回'" class="reject-reason">
							<text class="reject-label">审核驳回</text>
							<text class="reject-text">由于平台无法证实退款质量修改退款原因后重新进行提交</text>
						</view>
					</view>
				</view>

				<!-- 平台退款 -->
				<view class="timeline-item">
					<view class="timeline-dot" :class="aa.status === '审核通过' ? 'completed' : ''"></view>
					<view class="timeline-content">
						<text class="timeline-step">平台退款</text>
					</view>
				</view>

				<!-- 退款成功 -->
				<view class="timeline-item">
					<view class="timeline-dot" :class="aa.status === '审核通过' ? 'completed' : ''"></view>
					<view class="timeline-content">
						<text class="timeline-step">退款成功</text>
					</view>
				</view>
			</view>

			<!-- 关闭按钮 -->
			<view class="modal-footer">
				<button class="close-btn" @click="showDetailModal = false">我知道了</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from "vue"
	import { onShow } from "@dcloudio/uni-app"
	import { onLoad } from '@dcloudio/uni-app'
	const aa =ref()
	onLoad((options) => {
		if (options.data) {
			const data = JSON.parse(decodeURIComponent(options.data))
			aa.value = data
			console.log(aa.value);
		}
	})

	const showDetailModal = ref(false)
	const refundStatus = ref('审核中') // 可选：审核中、审核通过、审核驳回

	// 示例数据
	const refundInfo = ref({
		address: '陕西省西安市未央区白鹿原新兴景图2期3栋4号890',
		phone: '陕西省西安市未央区白鹿原新兴景图2期3栋4号890 详>×',
		pharmacyName: '大众药房',
		medicines: [
			{
				image: 'https://via.placeholder.com/80?text=药品1',
				name: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				description: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				price: '3200.00'
			},
			{
				image: 'https://via.placeholder.com/80?text=药品2',
				name: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				description: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				price: '3200.00'
			},
			{
				image: 'https://via.placeholder.com/80?text=药品3',
				name: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				description: '活澳葡萄糖BIO ISLAND哈喽哈喽好好好噶啦',
				price: '3200.00'
			}
		],
		totalPrice: '2000.00',
		tradeDate: '2026-03-11 12:00:00',
		payDate: '2026-03-11 12:00:00',
		deliveryDate: '2026-03-11 12:00:00',
		tradeType: '非处方药',
		tradeStatus: '待发货',
		payMethod: '支付宝'
	})

	// 取消退款
	const cancelRefund = () => {
		uni.showModal({
			title: '确认取消',
			content: '确定要取消此退款申请吗？',
			success: (res) => {
				if (res.confirm) {
					uni.showToast({ title: '已取消', icon: 'success' })
				}
			}
		})
	}

	onShow(() => {
		console.log('[v0] 退款详情页面加载，状态：', refundStatus.value)
	})
</script>

<style scoped lang="scss">
	.detail-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	// 顶部状态栏
	.top-bar {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #eee;

		.status-text {
			font-size: 40rpx;
			color: #333;
			font-weight: 600;
		}

		.detail-link {
			font-size: 24rpx;
			color: #999;
		}
	}

	// 退款信息区
	.info-section {
		background-color: #fff;
		padding: 24rpx 32rpx;
		margin: 20rpx;
		border-radius: 12rpx;

		.info-row {
			display: flex;
			align-items: center;
			margin-bottom: 12rpx;

			.info-label {
				font-size: 24rpx;
				color: #999;
				width: 80rpx;
			}

			.info-value {
				flex: 1;
				font-size: 24rpx;
				color: #333;
				line-height: 1.4;
			}

			.info-unit {
				font-size: 20rpx;
				color: #ccc;
			}

			.info-phone {
				flex: 1;
				font-size: 24rpx;
				color: #333;
				line-height: 1.4;
			}
		}

		.cancel-refund-btn {
			display: block;
			text-align: center;
			padding: 16rpx;
			margin-top: 20rpx;
			border-radius: 8rpx;
			font-size: 24rpx;
		}
	}

	// 药品区域
	.medicine-section {
		margin-top: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		.pharmacy-header {
			display: block;
			font-size: 28rpx;
			font-weight: 600;
			color: #333;
			padding-bottom: 20rpx;
			border-bottom: 1rpx solid #eee;
			margin-bottom: 20rpx;
		}

		.medicine-item {
			display: flex;
			margin-bottom: 24rpx;
			padding-bottom: 24rpx;
			border-bottom: 1rpx solid #eee;

			&:last-child {
				border-bottom: none;
				margin-bottom: 0;
				padding-bottom: 0;
			}

			.medicine-image {
				width: 120rpx;
				height: 120rpx;
				border-radius: 8rpx;
				margin-right: 16rpx;
				object-fit: cover;
			}

			.medicine-info {
				flex: 1;
				display: flex;
				flex-direction: column;

				.medicine-name {
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					line-height: 1.3;
				}

				.medicine-desc {
					font-size: 22rpx;
					color: #999;
					margin-top: 8rpx;
					line-height: 1.3;
				}

				.medicine-count {
					font-size: 22rpx;
					color: #999;
					margin-top: 8rpx;
				}
			}

			.medicine-price {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				justify-content: center;
				.price-value {
					font-size: 28rpx;
					color: #ff6b35;
					font-weight: 600;
				}

				.price-unit {
					font-size: 20rpx;
					color: #999;
					margin-top: 4rpx;
				}
			}
		}

		.total-section {
			padding-top: 20rpx;
			padding-bottom: 30rpx;
				border-bottom: 1rpx solid #eee;  
			.total-label {
				display: block;
				font-size: 24rpx;
				color: #999;
				margin-bottom: 16rpx;
			}

			.total-row {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.total-text {
					font-size: 28rpx;
					color: #333;
					font-weight: 600;
				}

				.total-price {
					font-size: 32rpx;
					color: #ff6b35;
					font-weight: bold;
				}
			}
		}
	}

	// 订单信息
	.order-info-section {
		
		background-color: #fff;
		margin: 0 20rpx;
		border-radius: 12rpx;
		padding: 24rpx;

		.info-item {
			display: flex;
			justify-content: space-between;
			padding: 16rpx 0;

			&:last-child {
				border-bottom: none;
			}

			.info-key {
				font-size: 24rpx;
				color: #999;
			}

			.info-val {
				font-size: 24rpx;
				color: #333;
			}
		}
	}

	// 模态框
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		width: 85vw;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		max-height: 80vh;
		overflow-y: auto;

		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;

			.modal-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}

			.modal-close {
				font-size: 36rpx;
				color: #999;
				font-weight: bold;
			}
		}

		// 时间轴样式
		.timeline {
			.timeline-item {
				display: flex;
				margin-bottom: 32rpx;
				position: relative;

				&:not(:last-child)::after {
					content: '';
					position: absolute;
					left: 12rpx;
					top: 50rpx;
					width: 2rpx;
					height: 60rpx;
					background-color: #eee;
				}

				.timeline-dot {
					width: 28rpx;
					height: 28rpx;
					border-radius: 50%;
					background-color: #d0d0d0;
					margin-right: 24rpx;
					margin-top: 6rpx;
					flex-shrink: 0;
					position: relative;
					z-index: 1;

					&.completed {
						background-color: #52ae7b;
					}

					&.rejected {
						background-color: #52ae7b;
					}
				}

				.timeline-content {
					flex: 1;

					.timeline-step {
						display: block;
						font-size: 26rpx;
						font-weight: 500;
						color: #333;
					}

					.reject-reason {
						margin-top: 12rpx;
						padding: 16rpx;
						background-color: #fef5f0;
						border-radius: 8rpx;

						.reject-label {
							display: block;
							font-size: 24rpx;
							color: #ff9500;
							font-weight: 600;
							margin-bottom: 8rpx;
						}

						.reject-text {
							display: block;
							font-size: 22rpx;
							color: #999;
							line-height: 1.4;
						}
					}
				}
			}
		}

		.modal-footer {
			margin-top: 32rpx;
			padding-top: 24rpx;
			border-top: 1rpx solid #eee;

			.close-btn {
				width: 100%;
				padding: 20rpx;
				background-color: #52ae7b;
				color: #fff;
				border: none;
				border-radius: 12rpx;
				font-size: 28rpx;
				font-weight: 600;
			}
		}
	}
</style>