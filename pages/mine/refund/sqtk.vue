<template>
	<view class="refund-container">
		<!-- 标签页 -->
		<view class="tab-bar">
			<view v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: activeTab === index }" @click="activeTab = index">
				<text class="tab-text">{{ tab }}</text>
				<view v-if="activeTab === index" class="tab-underline"></view>
			</view>
		</view>

		<!-- 审核中的退款列表 -->
		<view v-if="activeTab === 0" class="refund-list">
			<view v-for="(item, index) in refundListAuditing" :key="index" class="refund-card" @click="reapplyRefund(item)">
				<!-- 标题行 -->
				<view class="card-header">
					<text class="pharmacy-name">{{ item.pharmacyName }}</text>
					<text class="status-tag auditing">{{ item.status }}</text>
				</view>

				<!-- 药品图片网格 -->
				<view class="medicine-grid">
					<image v-for="(med, idx) in item.medicines" :key="idx" :src="med.image" class="medicine-image" />
				</view>

				<!-- 价格和操作 -->
				<view class="card-footer">
					<view class="price-section">
						<text class="currency">HK$</text>
						<text class="price">{{ item.totalPrice }}</text>
						<text class="currency-small">共{{ item.medicines.length }}件</text>
					</view>
					<view class="action-btn cancel-btn" @click="cancelRefund(item.id)">取消退款</view>
				</view>
			</view>
		</view>

		<!-- 审核通过的退款列表 -->
		<view v-if="activeTab === 1" class="refund-list" >
			<view v-for="(item, index) in refundListPassed" :key="index" class="refund-card" >
				<view class="card-header">
					<text class="pharmacy-name">{{ item.pharmacyName }}</text>
					<text class="status-tag passed">{{ item.status }}</text>
				</view>
				<view class="medicine-grid">
					<image v-for="(med, idx) in item.medicines" :key="idx" :src="med.image" class="medicine-image" />
				</view>
				<view class="card-footer">
					<view class="price-section">
						<text class="currency">HK$</text>
						<text class="price">{{ item.totalPrice }}</text>
						<text class="currency-small">共{{ item.medicines.length }}件</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 审核驳回的退款列表 -->
		<view v-if="activeTab === 2" class="refund-list">
			<view v-for="(item, index) in refundListRejected" :key="index" class="refund-card" @click="reapplyRefund(item)">
				<view class="card-header">
					<text class="pharmacy-name">{{ item.pharmacyName }}</text>
					<text class="status-tag rejected">{{ item.status }}</text>
				</view>
				<view class="medicine-grid">
					<image v-for="(med, idx) in item.medicines" :key="idx" :src="med.image" class="medicine-image" />
				</view>
				<view class="card-footer">
					<view class="price-section">
						<text class="currency">HK$</text>
						<text class="price">{{ item.totalPrice }}</text>
						<text class="currency-small">共{{ item.medicines.length }}件</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from "vue"
	import { onShow } from "@dcloudio/uni-app"

	const activeTab = ref(0)
	const tabs = ref(['审核中', '审核通过', '审核驳回'])

	// 示例数据 - 审核中
	const refundListAuditing = ref([
		{
			id: '1',
			pharmacyName: '大众药房',
			status: '审核中',
			totalPrice: '2000.00',
			medicines: [
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' }
			]
		}
	])

	// 示例数据 - 审核通过
	const refundListPassed = ref([
		{
			id: '2',
			pharmacyName: '康泰药房',
			status: '审核通过',
			totalPrice: '1500.00',
			medicines: [
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' }
			]
		}
	])

	// 示例数据 - 审核驳回
	const refundListRejected = ref([
		{
			id: '3',
			pharmacyName: '健康药店',
			status: '审核驳回',
			totalPrice: '800.00',
			medicines: [
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' },
				{ image: '/static/img/1.png' }
			]
		}
	])

	// 取消退款
	const cancelRefund = (id) => {
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

	// 重新申请
	const reapplyRefund = (item) => {
		uni.navigateTo({
				url: `/pages/mine/refund/sqtkdetail?data=${encodeURIComponent(JSON.stringify(item))}`
			})
	}

	onShow(() => {
		console.log('[v0] 退款列表页面加载')
	})
</script>

<style scoped lang="scss">
	.refund-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	// 标签页样式
	.tab-bar {
		display: flex;
		border-bottom: 1rpx solid #eee;
		padding: 0 32rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			position: relative;

			.tab-text {
				font-size: 28rpx;
				color: #999;
				font-weight: 500;
			}

			&.active {
				.tab-text {
					color: #333;
					font-weight: 600;
				}

				.tab-underline {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 4rpx;
					background-color: #52ae7b;
				}
			}
		}
	}

	// 退款列表
	.refund-list {
		padding: 24rpx 20rpx;
	}

	.refund-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24rpx;

			.pharmacy-name {
				font-size: 28rpx;
				font-weight: 600;
				color: #333;
			}

			.status-tag {
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				font-size: 20rpx;
				font-weight: 500;

				&.auditing {
					background-color: #f0f8f5;
					color: #52ae7b;
				}

				&.passed {
					background-color: #f0f8f5;
					color: #52ae7b;
				}

				&.rejected {
					background-color: #fef5f0;
					color: #ff6b35;
				}
			}
		}

		.medicine-grid {
			display: flex;
			gap: 16rpx;
			margin-bottom: 24rpx;
			overflow-x: auto;

			.medicine-image {
				width: 120rpx;
				height: 120rpx;
				border-radius: 8rpx;
				flex-shrink: 0;
				object-fit: cover;
			}
		}

		.card-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 24rpx;
			border-top: 1rpx solid #eee;

			.price-section {
				display: flex;
				align-items: baseline;
				gap: 4rpx;

				.currency {
					font-size: 20rpx;
					color: #ff6b35;
				}

				.price {
					font-size: 40rpx;
					font-weight: bold;
					color: #ff6b35;
				}

				.currency-small {
					font-size: 20rpx;
					color: #999;
				}
			}

			.action-btn {
				padding: 12rpx 32rpx;
				border-radius: 24rpx;
				font-size: 24rpx;
				font-weight: 500;
				border: 2rpx solid #999;
				color: #999;

				&.cancel-btn {
					border-color: #52ae7b;
					color: #52ae7b;
				}

				&.reapply-btn {
					border-color: #ff6b35;
					color: #ff6b35;
				}
			}
		}
	}
</style>