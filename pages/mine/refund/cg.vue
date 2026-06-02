<template>
	<view class="success-container">
		<!-- 成功图标 -->
		<view class="success-icon">
			<view class="checkmark-circle">
					<image src="/static/img/25.png" style="width: 80rpx;height: 80rpx;" mode=""></image>
			</view>
		</view>

		<!-- 标题 -->
		<text class="success-title">提交成功</text>

		<!-- 说明文字 -->
		<text class="success-description">退款申请已提交成功，请耐心等待审核～</text>
<button class="complete-btn" @click="handleComplete">完成</button>
		<!-- 完成按钮 -->
	
	</view>
</template>

<script setup>
	import { onShow } from "@dcloudio/uni-app"

	// 完成按钮点击事件
	const handleComplete = () => {
		// 返回到上一页
		uni.navigateBack({
			delta: 1
		})
	}

	onShow(() => {
		// 页面显示时的初始化
	})
</script>

<style scoped lang="scss">
	.success-container {
		padding: 48rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	// 成功图标
	.success-icon {
		margin-bottom: 48rpx;

		.checkmark-circle {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			background-color: #52ae7b;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;

			// 外部装饰圆点
			&::before {
				content: '';
				position: absolute;
				width: 140rpx;
				height: 140rpx;
				border-radius: 50%;
				border: 2rpx dashed rgba(82, 174, 123, 0.3);
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			.checkmark {
				font-size: 64rpx;
				color: #fff;
				font-weight: bold;
				line-height: 1;
			}
		}
	}

	// 成功标题
	.success-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		text-align: center;
	}

	// 说明文字
	.success-description {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		margin-bottom: 80rpx;
		line-height: 1.6;
	}

	// 按钮区域
	
		.complete-btn {
			width: 204rpx;
			height: 80rpx;
			background-color: #52ae7b;
			color: #fff;
			font-size: 32rpx;
			border-radius: 12rpx;
			border: none;
			font-weight: 600;

		}

</style>