<template>
	<view class="tab-wrapper">
		<view class="tab-item" :class="{ active: currentTab === '0' }" @click="switchTab('0')">
			未處理
		</view>
		<view class="tab-item" :class="{ active: currentTab === '1' }" @click="switchTab('1')">
			已處理
		</view>
	</view>
	<view class="container">
		<!-- 列表內容 -->
		<view class="list-wrapper">
			<view class="card-item" v-for="item in feedbackList" :key="item.id" @click="godetali(item.id)">
				<view class="card-header">
					<text class="card-title">{{ getFeedbackTypeText(item.feedbackType) }}</text>
					<text class="card-status" :class="item.dealTag === '1' ? 'status-done' : 'status-pending'">
						{{ item.dealTag === '1' ? '已處理' : '未處理' }}
					</text>
				</view>
				<view class="card-row">
					<text class="card-label">問題描述：</text>
					<text class="card-value text-ellipsis">{{ item.disc }}</text>
				</view>
				<view class="card-row">
					<text class="card-label">用户名稱：</text>
					<text class="card-value">{{ item.feedUser || '-' }}</text>
				</view>
				<view class="card-row">
					<text class="card-label">聯繫方式：</text>
					<text class="card-value">{{ item.contactPhone }}</text>
				</view>
				<view class="card-row">
					<text class="card-label">建議時間：</text>
					<text class="card-value">{{ item.feedTime }}</text>
				</view>
			</view>

			<!-- 空狀態 -->
			<view class="empty-state" v-if="feedbackList.length === 0">
				<text>暫無數據</text>
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
		onShow,
		onNavigationBarButtonTap
	} from "@dcloudio/uni-app";
	import {
		setNavigationBar
	} from "@/utils/navigation";
	import {
		selectfeedbacklist,
	} from "@/api/yyf.js"

	// 當前選中的tab，0-未處理，1-已處理
	const currentTab = ref('0');
	// 反饋列表數據
	const feedbackList = ref([]);

	// 獲取反饋類型文本
	const getFeedbackTypeText = (type) => {
		const typeMap = {
			'1': '醫生問題',
			'2': '支付問題',
			'3': '系統問題',
			'4': '其他'
		};
		return typeMap[type] || '其他問題';
	};

	// 切換tab
	const switchTab = (tab) => {
		currentTab.value = tab;
		getList();
	};

	// 獲取列表數據
	const getList = async () => {
		const phone = uni.getStorageSync('phone');
		const params = {
			contactPhone: phone,
			dealTag: currentTab.value
		};
		try {
			const res = await selectfeedbacklist(params);
			if (res.code === '200') {
				console.log(res);
				feedbackList.value = res.data.data || [];
			} else {
				showToast(res.msg || '獲取數據失敗');
			}
		} catch (error) {
			showToast('網絡錯誤');
		}
	};

	onNavigationBarButtonTap((e) => {
		uni.navigateTo({
			url: '/pages/mine/minelist/addopinion'
		})
	});
	onShow(() => {
		getList();
		console.log(uni.getStorageSync('userName'));
	});
	const godetali = (id) => {
		uni.navigateTo({
			url: `/pages/mine/minelist/detailopinion?id=${id}`
		})
	}
</script>

<style scoped lang="scss">
	.container {
		min-height: 100vh;
		padding: 20rpx;
		background-color: #F8F8F8;
		display: flex;
		flex-direction: column;

	}

	.tab-wrapper {
		display: flex;
		padding: 30rpx 0;
		background: #F8F8F8;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		color: #333;
		position: relative;

		&.active {
			color: #4CAF50;

			&::after {
				content: '';
				position: absolute;
				bottom: -10rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 4rpx;
				background-color: #4CAF50;
				border-radius: 2rpx;
			}
		}
	}

	.list-wrapper {
		padding: 20rpx;
	}

	.card-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.card-status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
	}

	.status-pending {
		color: #FF9800;
	}

	.status-done {
		color: #4CAF50;
	}

	.card-row {
		display: flex;
		margin-bottom: 12rpx;
		font-size: 20rpx;
		line-height: 1.5;
	}

	.card-label {
		color: #999;
		flex-shrink: 0;
	}

	.card-value {
		color: #666;
		flex: 1;
	}

	.text-ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
		color: #999;
		font-size: 28rpx;
	}
</style>