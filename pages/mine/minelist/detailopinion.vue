<template>
	<view class="container">
		<!-- 處理狀態 -->
		<view class="status-title">{{ dealTag === '0' ? '未處理' : '已處理' }}</view>

		<!-- 問題分類 -->
		<view class="info-section">
			<view class="section-row">
				<text class="section-label">問題分類</text>
				<text class="section-value">{{ feedbackTypeText }}</text>
			</view>
		</view>

		<!-- 問題描述 -->
		<view class="info-section">
			<view class="section-label">問題描述</view>
			<view class="desc-content">{{ disc }}</view>
		</view>

		<!-- 圖片 -->
		<view class="info-section" v-if="discPhoto && discPhoto !== 'null'">
			<view class="section-label">圖片</view>
			<view class="image-list">
				<image :src="discPhoto" mode="aspectFill" class="preview-image" @click="previewImage" />
			</view>
		</view>

		<!-- 用户信息 -->
		<view class="info-section">
			<view class="section-row">
				<text class="section-label">用户名稱</text>
				<text class="section-value">{{ feedUser }}</text>
			</view>
		</view>

		<view class="info-section">
			<view class="section-row">
				<text class="section-label">聯繫方式</text>
				<text class="section-value">{{ contactPhone }}</text>
			</view>
		</view>

		<view class="info-section">
			<view class="section-row">
				<text class="section-label">建議時間</text>
				<text class="section-value">{{ feedTime }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref,
		computed,
		onMounted
	} from "vue";
	import {
		showToast,
		showModal
	} from "@/utils/feedback.js";
	import {
		jumpToNextPage
	} from "@/utils/jumpTo";
	import {
		onLoad,
		onNavigationBarButtonTap
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		selectfeedbackdetail,
	} from "@/api/yyf.js"

	const id = ref('')
	const dealTag = ref('0')
	const feedbackType = ref('')
	const disc = ref('')
	const discPhoto = ref('')
	const contactPhone = ref('')
	const feedUser = ref('')
	const feedTime = ref('')

	// 圖片列表
	const imageList = computed(() => {
		if (!discPhoto.value) return []
		// 如果有多張圖片用逗號分隔
		return discPhoto.value.split(',').filter(item => item)
	})

	// 問題分類文字
	const feedbackTypeText = computed(() => {
		const typeMap = {
			'1': '醫生問題',
			'2': '支付問題',
			'3': '系統問題',
			'4': '其他'
		}
		return typeMap[feedbackType.value] || ''
	})

	// 預覽圖片
	const previewImage = (index) => {
		uni.previewImage({
			current: index,
			urls: imageList.value
		})
	}

	// 獲取詳情數據
	const getDetail = async () => {
		try {
			const res = await selectfeedbackdetail({
				id: id.value
			})
			if (res.code === '200' && res.data && res.data.data) {
				const data = res.data.data
				dealTag.value = data.dealTag || '0'
				feedbackType.value = data.feedbackType || ''
				disc.value = data.disc || ''
				discPhoto.value = data.discPhoto || ''
				contactPhone.value = data.contactPhone || ''
				feedUser.value = data.feedUser || ''
				feedTime.value = data.feedTime || ''
				console.log(discPhoto.value);
			}
		} catch (e) {
			console.error('獲取詳情失敗', e)
		}
	}

	onLoad((options) => {
		console.log('接收到的參數：', options)
		id.value = options.id
		getDetail()
	})
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background-color: #fff;
		padding: 40rpx 48rpx;
		display: flex;
		flex-direction: column;
	}

	.status-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
	}

	.info-section {
		margin-bottom: 32rpx;
	}

	.section-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.section-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.section-value {
		font-size: 28rpx;
		color: #999;
	}

	.desc-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-top: 16rpx;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 16rpx;
	}

	.preview-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		background-color: #f5f5f5;
	}
</style>