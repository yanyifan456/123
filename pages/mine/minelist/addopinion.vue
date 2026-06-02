<template>
	<view class="container">
		<!-- 問題分類 -->
		<view class="section">
			<view class="section-title">問題分類</view>
			<view class="type-list">
				<view 
					class="type-item" 
					:class="{ active: formData.feedbackType === '1' }"
					@click="selectType('1')"
				>
					醫生問題
				</view>
				<view 
					class="type-item" 
					:class="{ active: formData.feedbackType === '2' }"
					@click="selectType('2')"
				>
					支付問題
				</view>
				<view 
					class="type-item" 
					:class="{ active: formData.feedbackType === '3' }"
					@click="selectType('3')"
				>
					系統問題
				</view>
				<view 
					class="type-item" 
					:class="{ active: formData.feedbackType === '4' }"
					@click="selectType('4')"
				>
					其它
				</view>
			</view>
		</view>

		<!-- 問題描述 -->
		<view class="section">
			<view class="section-title">問題描述<text class="required">*</text></view>
			<view class="textarea-wrapper">
				<textarea 
					class="textarea"
					v-model="formData.disc"
					placeholder="請寫出10個字以上的內容，以便我們為您提供更好的內容"
					placeholder-class="placeholder"
					maxlength="300"
				/>
				<view class="word-count">{{ formData.disc.length }}/300</view>
			</view>
		</view>

		<!-- 上傳圖片 -->
		<view class="section">
			<view class="section-title">上傳圖片</view>
			<view class="image-list">
				<view class="image-item" v-for="(item, index) in imageList" :key="index">
					<image class="preview-image" :src="item" mode="aspectFill" />
					<view class="delete-btn" @click="deleteImage(index)">
						<text class="delete-icon">×</text>
					</view>
				</view>
				<view class="upload-btn" @click="chooseImage" v-if="imageList.length < 1">
					<view class="upload-icon">
						<view class="upload-icon-box"></view>
						<view class="upload-icon-arrow"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提交按鈕 -->
		<view class="submit-btn" @click="submitFeedback">提交</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		ref,
		reactive
	} from "vue";
	import {
		onShow
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation.js";
	import {
		jumpToNextPage
	} from "@/utils/jumpTo";
	import {
		showModal
	} from "@/utils/feedback";
	import {
		BASE_URL
	} from '@/utils/setting.js';
	
	// 表單數據
	const formData = reactive({
		feedbackType: '1',  // 反饋類型 1醫生問題 2支付問題 3系統問題 4其他
		disc: '',           // 問題描述
		contactPhone: '',   // 聯繫電話
		feedUser: ''        // 用户名
	})

	// 圖片列表
	const imageList = ref([])

	onShow(() => {
		setNavigationBar({ title: "意見反饋" })
		// 獲取用户信息
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo) {
			formData.contactPhone = userInfo.phone || uni.getStorageSync('phone') || ''
			formData.feedUser = userInfo.userName || userInfo.name || ''
		}
	})

	// 選擇反饋類型
	const selectType = (type) => {
		formData.feedbackType = type
	}

	// 選擇圖片
	const chooseImage = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				imageList.value = [res.tempFilePaths[0]]
			}
		})
	}

	// 刪除圖片
	const deleteImage = (index) => {
		imageList.value.splice(index, 1)
	}

	// 提交反饋
	const submitting = ref(false)
	
	const submitFeedback = async () => {
		// 防重複提交
		if (submitting.value) return
		submitting.value = true
	
		// 校驗
		if (!formData.disc || formData.disc.length < 10) {
			uni.showToast({
				title: '請輸入至少10個字的問題描述',
				icon: 'none'
			})
			submitting.value = false
			return
		}
	
		uni.showLoading({ title: '提交中...' })
	
		try {
			const token = uni.getStorageSync("token")
			
			const url =  BASE_URL + '/appfeedback/addfeedback'
	
			const feedBackStr = JSON.stringify({
				feedbackType: formData.feedbackType,
				disc: formData.disc,
				contactPhone: uni.getStorageSync('phone') || '',
				feedUser: uni.getStorageSync('userName') || ''
			})
	
			// ✅ 上傳函數（封裝）
			const uploadOne = (filePath) => {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url,
						filePath: filePath || '', // 沒圖也能走
						name: 'file',
						header: {
							Authorization: `Bearer ${token}`
						},
						formData: {
							feedBackStr
						},
						success: (res) => {
							try {
								resolve(JSON.parse(res.data))
							} catch (e) {
								reject(e)
							}
						},
						fail: reject
					})
				})
			}
	
			let finalRes = null
	
			// ✅ 有圖片：逐個上傳（更穩）
			if (imageList.value.length > 0) {
				for (let i = 0; i < imageList.value.length; i++) {
					finalRes = await uploadOne(imageList.value[i])
				}
			} else {
				// ✅ 沒圖片：也走 uploadFile（關鍵點！！）
				finalRes = await uploadOne('')
			}
	
			uni.hideLoading()
	
			if (finalRes.code === 200 || finalRes.code === "200") {
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				})
	
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			} else {
				uni.showToast({
					title: finalRes.message || '提交失敗',
					icon: 'none'
				})
			}
	
		} catch (e) {
			uni.hideLoading()
			console.error('提交失敗', e)
	
			uni.showToast({
				title: '提交失敗',
				icon: 'none'
			})
		} finally {
			submitting.value = false
		}
	}
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		background-color: #fff;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		padding-bottom: 150rpx;
		
	}

	.section {
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 20rpx;
		font-weight: 600;

		.required {
			color: #ff4d4f;
			margin-left: 4rpx;
		}
	}

	.type-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.type-item {
		padding: 16rpx 32rpx;
		border: 2rpx solid #e5e5e5;
		border-radius: 40rpx;
		font-size: 26rpx;
		color: #666;
		background-color: #fff;

		&.active {
			border-color: #52AE7B;
			color: #52AE7B;
			background-color: #f0fff0;
		}
	}

	.textarea-wrapper {
		background-color: #f5f5f5;
		border-radius: 16rpx;
		padding: 24rpx;
		position: relative;
	}

	.textarea {
		width: 100%;
		height: 240rpx;
		font-size: 28rpx;
		line-height: 1.6;
		background-color: transparent;
	}

	.placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.word-count {
		position: absolute;
		right: 24rpx;
		bottom: 24rpx;
		font-size: 24rpx;
		color: #999;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.image-item {
		width: 160rpx;
		height: 160rpx;
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.preview-image {
		width: 100%;
		height: 100%;
	}

	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 36rpx;
		height: 36rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 0 0 0 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-icon {
		color: #fff;
		font-size: 28rpx;
		line-height: 1;
	}

	.upload-btn {
		width: 160rpx;
		height: 160rpx;
		background-color: #f5f5f5;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-icon {
		width: 60rpx;
		height: 60rpx;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-icon-box {
		width: 50rpx;
		height: 40rpx;
		border: 4rpx solid #ccc;
		border-radius: 8rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -10rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 20rpx;
			height: 10rpx;
			background-color: #f5f5f5;
			border: 4rpx solid #ccc;
			border-bottom: none;
			border-radius: 6rpx 6rpx 0 0;
		}
	}

	.upload-icon-arrow {
		position: absolute;
		top: 8rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 12rpx solid transparent;
		border-right: 12rpx solid transparent;
		border-bottom: 16rpx solid #ccc;

		&::after {
			content: '';
			position: absolute;
			top: 14rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 6rpx;
			height: 20rpx;
			background-color: #ccc;
		}
	}

	.submit-btn {
		position: fixed;
		left: 30rpx;
		right: 30rpx;
		bottom: 60rpx;
		height: 96rpx;
		background-color: #52AE7B;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #fff;
		font-weight: 500;
	}
</style>
