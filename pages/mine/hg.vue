<template>
	<view class="container">
		<!-- 表单内容 -->
		<view class="form-body">
			<!-- 姓名 -->
			<view class="form-group">
				<text class="form-label">姓名</text>
				<view class="form-input-wrap">
					<input
						class="form-input"
						v-model="form.userName"
						placeholder="请填写真实姓名"
						placeholder-style="color: #ccc;"
					/>
				</view>
			</view>

			<!-- 证件类型 -->
			<view class="form-group">
				<text class="form-label">证件类型</text>
				<view class="form-select-wrap" @click="showTypePicker = true">
					<text class="form-select-text">{{ certTypeLabel }}</text>
					<text class="form-select-arrow">∨</text>
				</view>
			</view>

			<!-- 证件上传 -->
			<view class="form-group">
				<text class="form-label">证件上传</text>
				<view class="upload-row">
					<!-- 正面 -->
					<view class="upload-card" @click="chooseImage('front')">
						<image v-if="form.front" :src="form.front" class="upload-preview" mode="aspectFill"></image>
						<view v-else class="upload-placeholder">
							<view class="upload-icon-wrap">
								<text class="upload-icon">📷</text>
							</view>
							<text class="upload-tip">上传证件正面</text>
						</view>
					</view>
					<!-- 反面 -->
					<view class="upload-card" @click="chooseImage('back')">
						<image v-if="form.back" :src="form.back" class="upload-preview" mode="aspectFill"></image>
						<view v-else class="upload-placeholder">
							<view class="upload-icon-wrap">
								<text class="upload-icon">📷</text>
							</view>
							<text class="upload-tip">上传证件反面</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 证件号码 -->
			<view class="form-group">
				<text class="form-label">证件号码</text>
				<view class="form-input-wrap">
					<input
						class="form-input"
						v-model="form.idCardNo"
						placeholder="请填写正确的身份证号码"
						placeholder-style="color: #ccc;"
					/>
				</view>
			</view>

			<!-- 电话 -->
			<view class="form-group">
				<text class="form-label">电话</text>
				<view class="form-input-wrap">
					<input
						class="form-input"
						v-model="form.serialNumber"
						placeholder="请填写真实姓名"
						placeholder-style="color: #ccc;"
					/>
				</view>
			</view>
		</view>

		<!-- 确认按钮 -->
		<view class="bottom-bar">
			<view class="confirm-btn" @click="handleConfirm">确认</view>
		</view>

		<!-- 证件类型选择器 -->
		<view v-if="showTypePicker" class="picker-overlay" @click="showTypePicker = false">
			<view class="picker-panel" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择证件类型</text>
					<text class="picker-close" @click="showTypePicker = false">✕</text>
				</view>
				<view
					class="picker-item"
					v-for="item in certTypeOptions"
					:key="item.value"
					:class="{ active: form.idCardNoType === item.value }"
					@click="selectCertType(item)"
				>
					<text class="picker-item-text">{{ item.label }}</text>
					<text v-if="form.idCardNoType === item.value" class="picker-check">✓</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getuser } from '@/api/yyf.js';

const form = ref({
	userName: '',
	idCardNo: '',
	idCardNoType: 'ID_CARD',
	serialNumber: '',
	front: '',
	back: ''
});

const showTypePicker = ref(false);

const certTypeOptions = [
	{ label: '身份证', value: 'ID_CARD' },
	{ label: '护照', value: 'PASSPORT' },
	{ label: '港澳居民来往内地通行证', value: 'HK_MACAO' },
	{ label: '台湾居民来往大陆通行证', value: 'TAIWAN' }
];

const certTypeLabel = computed(() => {
	const found = certTypeOptions.find((item) => item.value === form.value.idCardNoType);
	return found ? found.label : '身份证';
});

const selectCertType = (item) => {
	form.value.idCardNoType = item.value;
	showTypePicker.value = false;
};

// 选择图片
const chooseImage = (side) => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const tempPath = res.tempFilePaths[0];
			if (side === 'front') {
				form.value.front = tempPath;
			} else {
				form.value.back = tempPath;
			}
		}
	});
};

// 加载用户信息回显
onLoad(async () => {
	try {
		const res = await getuser({
			serialNumber: uni.getStorageSync('phone')
		});
		if (res.code === '200' && res.data && res.data.data) {
			const d = res.data.data;
			form.value.userName = d.userName || '';
			form.value.idCardNo = d.idCardNo || '';
			form.value.idCardNoType = d.idCardNoType || 'ID_CARD';
			form.value.serialNumber = d.serialNumber || '';
			form.value.front = d.front || '';
			form.value.back = d.back || '';
		}
	} catch (e) {
		console.log(e);
	}
});

// 确认提交
const handleConfirm = () => {
	uni.setStorageSync("hgrz", 'hgrz');
	uni.navigateBack()
};

const goBack = () => {
	uni.navigateBack();
};
</script>

<style scoped lang="scss">
.container {
	min-height: 100vh;
	background: #FFFFFF;
	display: flex;
	flex-direction: column;
}

// 导航栏
.nav-bar {
	background-color: #fff;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32rpx;
	border-bottom: 1rpx solid #f0f0f0;

	.nav-back {
		width: 60rpx;
		display: flex;
		align-items: center;

		.nav-back-icon {
			font-size: 48rpx;
			color: #333;
			line-height: 1;
		}
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.nav-placeholder {
		width: 60rpx;
	}
}

// 表单主体
.form-body {
	flex: 1;
	padding: 24rpx 0;
}

.form-group {
	background-color: #fff;
	margin-bottom: 2rpx;
	padding: 32rpx 32rpx 0;

	&:last-child {
		padding-bottom: 32rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 24rpx;
	}

	.form-input-wrap {
		border: 1rpx solid #eee;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
		margin-bottom: 32rpx;
	box-shadow: 0rpx 6rpx 24rpx 2rpx rgba(68,68,68,0.16);

		.form-input {
			width: 100%;
			font-size: 28rpx;
			color: #333;
		}
	}

	.form-select-wrap {
		border: 1rpx solid #eee;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
		margin-bottom: 32rpx;
		background-color: #fafafa;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.form-select-text {
			font-size: 28rpx;
			color: #333;
		}

		.form-select-arrow {
			font-size: 24rpx;
			color: #999;
		}
	}
}

// 上传区域
.upload-row {
	display: flex;
	gap: 24rpx;
	margin-bottom: 32rpx;

	.upload-card {
		flex: 1;
		height: 200rpx;
		border: 2rpx dashed #ddd;
		border-radius: 16rpx;
		background-color: #fafafa;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;

		.upload-preview {
			width: 100%;
			height: 100%;
		}

		.upload-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 16rpx;

			.upload-icon-wrap {
				width: 72rpx;
				height: 72rpx;
				background-color: #4db87a;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.upload-icon {
					font-size: 36rpx;
				}
			}

			.upload-tip {
				font-size: 22rpx;
				color: #bbb;
			}
		}
	}
}

// 底部确认按钮
.bottom-bar {
	background-color: #fff;
	padding: 24rpx 48rpx 64rpx;

	.confirm-btn {
		width: 100%;
		height: 96rpx;
		background-color: #52ae7b;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 34rpx;
		color: #fff;
		font-weight: bold;
	}
}

// 证件类型选择器
.picker-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: flex-end;
	z-index: 999;

	.picker-panel {
		width: 100%;
		background-color: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: 48rpx;

		.picker-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 36rpx 40rpx 24rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.picker-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.picker-close {
				font-size: 32rpx;
				color: #999;
			}
		}

		.picker-item {
			padding: 36rpx 40rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f9f9f9;

			&.active {
				.picker-item-text {
					color: #52ae7b;
				}
			}

			.picker-item-text {
				font-size: 30rpx;
				color: #333;
			}

			.picker-check {
				font-size: 28rpx;
				color: #52ae7b;
				font-weight: bold;
			}
		}
	}
}
</style>
