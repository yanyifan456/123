<template>
	<view class="refund-container">
		<!-- 退款信息展示 -->
		<view class="refund-info">
			<view class="info-item">
				<text class="info-label">退款原因<text class="required">*</text></text>
				<view class="info-value-wrapper" @click="openRefundReasonModal">
					<text class="info-value">{{ selectedRefundReason || '请选择' }}</text>
					<text class="arrow">&gt;</text>
				</view>
			</view>

			<view class="info-item">
				<text class="info-label">退款金额<text class="required">*</text></text>
				<text class="info-value refund-amount">HK${{ refundAmount }}</text>
			</view>

			<view class="info-item">
				<text class="info-label">退款方式</text>
				<text class="info-value">{{ refundMethod }}</text>
			</view>
		</view>

	<!-- 提交按钮 -->
	<view class="submit-btn-wrapper">
		<button class="submit-btn" :class="{ active: selectedRefundReason }" @click="submitRefund">提交</button>
	</view>

		<!-- 退款原因选择弹窗 -->
		<view v-if="refundReasonModalVisible" class="modal-overlay" @click="closeRefundReasonModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">退款原因选择</text>
					<text class="modal-close" @click="closeRefundReasonModal">✕</text>
				</view>

				<!-- 选项列表 -->
				<view class="options-list">
					<view v-for="option in refundReasonOptions" :key="option.id" class="option-item"
						@click="selectRefundReason(option)">
						<text class="option-label">{{ option.label }}</text>
						<view class="radio-button" :class="{ active: selectedOptionId === option.id }">
							<view v-if="selectedOptionId === option.id" class="radio-inner"></view>
						</view>
					</view>
				</view>

				<!-- 其他原因输入框 -->
				<view v-if="selectedOptionId === 'other'" class="textarea-wrapper">
					<textarea v-model="otherRefundReason" class="reason-textarea" placeholder="请输入退款原因" maxlength="200"
						@input="onTextChange" />
					<text class="char-count">{{ otherRefundReason.length }}/200</text>
				</view>

				<!-- 确定按钮 -->
				<view class="modal-footer">
					<button class="confirm-btn" :class="{ active: isConfirmBtnActive }" @click="confirmRefundReason"
						:disabled="!isConfirmBtnActive">
						确定
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from "vue"
	import {
		onShow
	} from "@dcloudio/uni-app"

	// 退款原因选项
	const refundReasonOptions = [{
			id: 'quality',
			label: '买质了'
		},
		{
			id: 'duplicate',
			label: '重复下单'
		},
		{
			id: 'not_needed',
			label: '不想要了/暂无需求'
		},
		{
			id: 'other',
			label: '其他原因'
		}
	]

	// 状态
	const refundReasonModalVisible = ref(false)
	const selectedOptionId = ref(null)
	const selectedRefundReason = ref('')
	const otherRefundReason = ref('')
	const refundAmount = ref('100')
	const refundMethod = ref('原路返回')

	// 确定按钮是否激活
	const isConfirmBtnActive = computed(() => {
		if (selectedOptionId.value === 'other') {
			return otherRefundReason.value.trim().length > 0
		}
		return selectedOptionId.value && selectedOptionId.value !== 'other'
	})

	// 打开弹窗
	const openRefundReasonModal = () => {
		refundReasonModalVisible.value = true
	}

	// 关闭弹窗
	const closeRefundReasonModal = () => {
		refundReasonModalVisible.value = false
	}

	// 选择退款原因
	const selectRefundReason = (option) => {
		selectedOptionId.value = option.id
		if (option.id !== 'other') {
			otherRefundReason.value = ''
		}
	}

	// 文本变化处理
	const onTextChange = (e) => {
		otherRefundReason.value = e.detail.value
	}

	// 确认退款原因
	const confirmRefundReason = () => {
		if (!isConfirmBtnActive.value) {
			return
		}

		// 设置选中的原因
		if (selectedOptionId.value === 'other') {
			selectedRefundReason.value = otherRefundReason.value
		} else {
			const selected = refundReasonOptions.find(opt => opt.id === selectedOptionId.value)
			selectedRefundReason.value = selected ? selected.label : ''
		}

		// 关闭弹窗
		closeRefundReasonModal()
	}

	// 提交退款申请
	const submitRefund = () => {
		if (!selectedRefundReason.value) {
			uni.showToast({
				title: '请选择退款原因',
				icon: 'none'
			})
			return
		}

		// 构建提交数据
		const submitData = {
			refundReason: selectedRefundReason.value,
			refundAmount: refundAmount.value,
			refundMethod: refundMethod.value
		}

		console.log('提交退款申请:', submitData)

		// 跳转到成功页面
		uni.navigateTo({
			url: '/pages/mine/refund/cg'
		})
	}

	onShow(() => {
		// 页面显示时的初始化
	})
</script>

<style scoped lang="scss">
	.refund-container {
		padding: 48rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	// 退款信息展示
	.refund-info {
		background-color: #fff;
		margin-top: 0;
		padding: 32rpx;
		border-radius: 20rpx 20rpx 20rpx 20rpx;

		.info-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;

				.required {
					color: #ff4444;
					margin-left: 4rpx;
				}
			}

			.info-value-wrapper {
				display: flex;
				align-items: center;
				gap: 12rpx;
				cursor: pointer;

				.info-value {
					font-size: 26rpx;
					color: #666;
				}

				.arrow {
					font-size: 24rpx;
					color: #999;
				}
			}

			.info-value {
				font-size: 26rpx;
				color: #666;

				&.refund-amount {
					color: #ff5555;
					font-size: 28rpx;
					font-weight: bold;
				}
			}
		}
	}

	// 提交按钮
	.submit-btn-wrapper {
		padding: 32rpx;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #f5f5f5;

		.submit-btn {
			width: 100%;
			height: 96rpx;
			background-color: #999;
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			border: none;
			font-weight: 600;
			transition: background-color 0.3s ease;

			&.active {
				background-color: #52ae7b;
			}

			&:active {
				opacity: 0.9;
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
		align-items: flex-end;
		z-index: 999;
	}

	.modal-content {
		width: 100%;
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		animation: slideUp 0.3s ease-out;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;

		.modal-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.modal-close {
			font-size: 32rpx;
			color: #999;
			cursor: pointer;
		}
	}

	// 选项列表
	.options-list {
		flex: 1;
		overflow-y: auto;
		padding: 0;

		.option-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 32rpx;
			border-bottom: 1rpx solid #f5f5f5;
			cursor: pointer;

			&:last-child {
				border-bottom: none;
			}

			.option-label {
				font-size: 28rpx;
				color: #333;
			}

			.radio-button {
				width: 36rpx;
				height: 36rpx;
				border: 2rpx solid #d0d0d0;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;

				&.active {
					border-color: #52ae7b;
					background-color: #52ae7b;

					.radio-inner {
						width: 10rpx;
						height: 10rpx;
						background-color: #fff;
						border-radius: 50%;
					}
				}
			}
		}
	}

	// 文本输入框
	.textarea-wrapper {
		padding: 24rpx 32rpx;
		border-top: 1rpx solid #f5f5f5;
		position: relative;

		.reason-textarea {
			width: 100%;
			min-height: 160rpx;
			padding: 16rpx;
			border: 1rpx solid #d0d0d0;
			border-radius: 8rpx;
			font-size: 26rpx;
			color: #333;
			box-sizing: border-box;
			resize: none;

			&::placeholder {
				color: #999;
			}
		}

		.char-count {
			position: absolute;
			bottom: 32rpx;
			right: 32rpx;
			font-size: 22rpx;
			color: #999;
		}
	}

	// 模态框底部
	.modal-footer {
		padding: 24rpx 32rpx 32rpx;
		border-top: 1rpx solid #f5f5f5;
		flex-shrink: 0;

		.confirm-btn {
			width: 100%;
			height: 88rpx;
			background-color: #999;
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			border: none;
			font-weight: 600;
			transition: background-color 0.3s ease;

			&.active {
				background-color: #52ae7b;
			}

			&:disabled {
				opacity: 0.6;
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
</style>