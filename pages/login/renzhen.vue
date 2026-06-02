<template>
	<view class="page-wrap">
		<!-- 表單卡片 -->
		<view class="form-card">
			<view class="divider"></view>
			<!-- 姓名 -->
			<view class="form-row">
				<text class="label">姓名</text>
				<input class="input" v-model="formData.name" placeholder="請輸入姓名" placeholder-style="color:#c0c0c0;font-size:28rpx;" :disabled="submitted || submitting" />
			</view>
			<view class="divider"></view>
			<!-- 證件類型 -->
			<view class="form-row form-row--arrow" @click="openPicker">
				<text class="label">證件類型</text>
				<view class="row-right">
					<text :class="['input-text', formData.certType ? 'input-text--filled' : '']">
						{{ formData.certType || '請選擇' }}
					</text>
					<text class="arrow">›</text>
				</view>
			</view>
			<view class="divider"></view>
			<!-- 身份證號 -->
			<view class="form-row">
				<text class="label">身份證號</text>
				<input
					class="input"
					v-model="formData.idNo"
					placeholder="請輸入真實身份證號碼"
					placeholder-style="color:#c0c0c0;font-size:28rpx;"
					:disabled="submitted || submitting"
				/>
			</view>

			<view class="divider"></view>

			<!-- 照片上傳 -->
			<view class="upload-row">
				<view class="upload-item" @click="chooseImage('front')">
					<image v-if="formData.frontImg" :src="formData.frontImg" class="upload-preview" mode="aspectFill"></image>
					<view v-else class="upload-placeholder">
						<image :src="'/static/img/8.png'" class="upload-placeholder-img" mode="aspectFit"></image>
					</view>
					<text class="upload-label">證件正面照</text>
				</view>
				<view class="upload-item" @click="chooseImage('back')">
					<image v-if="formData.backImg" :src="formData.backImg" class="upload-preview" mode="aspectFill"></image>
					<view v-else class="upload-placeholder">
						<image :src="'/static/img/9.png'" class="upload-placeholder-img" mode="aspectFit"></image>
					</view>
					<text class="upload-label">證件反面照</text>
				</view>
			</view>
			<!-- 溫馨提示 -->
			<view class="tips-row">
				<text class="tips-text">
					溫馨提示：務必上傳證件
					<text style="color: #ff4c10">（正上方）</text>
					，圖像清晰，否則審核不通過！
				</text>
			</view>
		</view>
		<!-- 底部提交按鈕 -->
		<view class="bottom-bar">
			<view :class="['submit-btn', isFormComplete && !submitting ? 'submit-btn--active' : '']" @click="submit">
				<text class="submit-text">{{ submitting ? '提交中...' : '提交認證' }}</text>
			</view>
		</view>
		<!-- 證件類型彈窗 -->
		<view v-if="showPicker" class="picker-mask" @click.self="closePicker">
			<view class="picker-panel">
				<!-- 頂部操作欄 -->
				<view class="picker-header">
					<text class="picker-cancel" @click="closePicker">取消</text>
					<text class="picker-title">證件類型</text>
					<text class="picker-confirm" @click="confirmPicker">確認</text>
				</view>
				<!-- 加載中 -->
				<view v-if="pickerLoading" class="picker-loading">
					<text class="picker-loading-text">加載中...</text>
				</view>
				<!-- 選項列表 -->
				<view v-else class="picker-list">
					<view
						v-for="(item, index) in certTypeList"
						:key="index"
						class="picker-item"
						:class="{ 'picker-item--active': tempCertType === item.certName }"
						@click="selectCertType(item)"
					>
						<text :class="['picker-item-text', tempCertType === item.certName ? 'picker-item-text--active' : '']">
							{{ item.certName }}
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { setNavigationBar } from '@/utils/navigation';
import { leiixng, init, results } from '@/api/yyf.js';
import { BASE_URL } from '@/utils/setting.js';

// 阿里云实人认证插件
const aliyunVerify = uni.requireNativePlugin('AP-FaceDetectModule');

// 统一 Toast 封装，保证 title 始终是字符串，避免 App 层 indexOf 报错
const showToast = (title, duration = 1500, icon = 'none') => {
	uni.showToast({
		title: title ? String(title) : ' ',
		duration,
		icon
	});
};

onLoad(() => {
	setNavigationBar('實名認證', '#459767');
	console.log(uni.getStorageSync('countryCode'));
});
const submitted = ref(false);
// 是否正在提交中（接口調用期間）
const submitting = ref(false);
// 表單數據
const formData = ref({
	name: '',
	certType: '', // 顯示用的 certName
	typeId: '', // 提交用的 typeId
	idNo: '',
	frontImg: '',
	backImg: ''
});
// 證件類型列表（從接口返回，格式：[{ id, typeId, certName, certType }]）
const certTypeList = ref([]);
// picker 狀態
const showPicker = ref(false);
const pickerLoading = ref(false);
const tempCertType = ref(''); // 暫存選中的 certName
const tempTypeId = ref(''); // 暫存選中的 typeId

// ========== 大陸身份證18位校驗（含校驗碼） ==========
const validateMainlandId = (idNo) => {
	if (!idNo || idNo.length !== 18) return false;
	// 前17位必須是數字，第18位可以是數字或X/x
	const reg = /^\d{17}[\dXx]$/;
	if (!reg.test(idNo)) return false;
	// 加權因子
	const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
	// 校驗碼對應值
	const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
	let sum = 0;
	for (let i = 0; i < 17; i++) {
		sum += parseInt(idNo.charAt(i), 10) * weights[i];
	}
	const mod = sum % 11;
	const expectedCheck = checkCodes[mod];
	const actualCheck = idNo.charAt(17).toUpperCase();
	return expectedCheck === actualCheck;
};

// 打開 picker，同時請求接口
const openPicker = async () => {
	if (submitted.value || submitting.value) return;
	tempCertType.value = formData.value.certType || '';
	tempTypeId.value = formData.value.typeId || '';
	showPicker.value = true;
	pickerLoading.value = true;
	console.log(uni.getStorageSync('token'));
	try {
		const res = await leiixng({
			certType: '1'
		});
		console.log(res);
		if (res.code === '200' && res.data && res.data.data) {
			certTypeList.value = res.data.data;
			// 若列表有值且尚未選過，預設選第一項
			if (!tempCertType.value && certTypeList.value.length > 0) {
				tempCertType.value = certTypeList.value[0].certName;
				tempTypeId.value = certTypeList.value[0].typeId;
			}
		} else {
			showToast(res.data?.message || '獲取失敗');
		}
	} catch (err) {
		console.log(err);
	} finally {
		pickerLoading.value = false;
	}
};
// 關閉 picker
const closePicker = () => {
	showPicker.value = false;
};
// 選中某項
const selectCertType = (item) => {
	tempCertType.value = item.certName;
	tempTypeId.value = item.typeId;
};
// 確認選擇（切換證件類型時��空證件號碼和圖片）
const confirmPicker = () => {
	const prevCertType = formData.value.certType;
	formData.value.certType = tempCertType.value;
	formData.value.typeId = tempTypeId.value;
	// 如果證件類型發生變化，清空證件號和圖片
	if (prevCertType && prevCertType !== tempCertType.value) {
		formData.value.idNo = '';
		formData.value.frontImg = '';
		formData.value.backImg = '';
	}
	showPicker.value = false;
};
// 選擇圖片
const chooseImage = (type) => {
	if (submitted.value || submitting.value) return;
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			if (type === 'front') {
				formData.value.frontImg = res.tempFilePaths[0];
			} else {
				formData.value.backImg = res.tempFilePaths[0];
			}
		}
	});
};
// 判斷表單是否填完
const isFormComplete = computed(() => {
	const base = formData.value.name && formData.value.certType && formData.value.idNo;
	return !!(base && formData.value.frontImg && formData.value.backImg);
});

const submit = async () => {
	if (!isFormComplete.value || submitted.value || submitting.value) return;
	submitting.value = true;

	// ========== 提交前校驗證件號碼 ==========
	if (!validateMainlandId(formData.value.idNo)) {
		showToast('請輸入正確的18位大陸身份證號碼');
		submitting.value = false;
		return;
	}

	// 校验图片
	if (!formData.value.frontImg || !formData.value.backImg) {
		showToast('请上传正反面身份证照片');
		submitting.value = false;
		return;
	}

	uni.showLoading({
		title: '提交中...'
	});

	try {
		// 1. 首先进行实人认证
		const certifyId = await performRealNameVerification();
		console.log('实人认证成功，certifyId:', certifyId);

		// 2. 然后上传身份证照片
		await uploadIdCardPhotos(certifyId);
	} catch (err) {
		console.error('提交错误:', err);
		showToast('提交失败，请重试');
	} finally {
		submitting.value = false;
		uni.hideLoading();
	}
};

// 执行实人认证
const performRealNameVerification = async () => {
	const system = uni.getSystemInfoSync();

	if (system.platform !== 'android') {
		throw new Error('仅支持安卓设备');
	}

	try {
		// 获取设备元信息
		const metaInfo = aliyunVerify.getMetaInfo();
		console.log('设备元信息:', metaInfo);
		const params = {
			userId: uni.getStorageSync('userId') || '7',
			realName: formData.value.name,
			typeId: formData.value.typeId,
			idCardNo: formData.value.idNo,
			metaInfo: metaInfo
		};
		console.log('初始化参数:', params);
		// 调用初始化接口
		const res = await init(params);
		console.log('初始化结果:', res);

		// 提取certifyId
		let certifyId = res.data?.data?.certifyId || res.data?.certifyId;
		if (!certifyId) {
			throw new Error('certifyId获取失败');
		}
		console.log('获取到的certifyId:', certifyId);

		// 执行实人认证
		return new Promise((resolve, reject) => {
			aliyunVerify.verify(
				{
					certifyId
				},
				(result) => {
					console.log('认证结果:', result);

					if (result.code === 1000) {
						// 认证成功，返回certifyId
						resolve(certifyId);
					} else {
						reject(new Error('实人认证失败'));
						uni.showModal({
							title: '认证失败',
							content: '认证失败，是否重新认证？',
							showCancel: true,
							cancelText: '取消',
							confirmText: '重新认证',
							success: (res) => {
								if (res.confirm) {
									submit();
								}
							}
						});
					}
				}
			);
		});
	} catch (e) {
		console.error('实人认证异常:', e);
		throw e;
	}
};
// 上传身份证照片（风格对齐 handleConfirm）
const uploadIdCardPhotos = async (certifyId) => {
	const token = uni.getStorageSync('token');
	const certifyStr = JSON.stringify({
		certifyId
	});
	console.log('用户信息:', certifyStr);

	const res = await new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/verify/result',
			files: [
				{
					name: 'front',
					uri: formData.value.frontImg
				},
				{
					name: 'back',
					uri: formData.value.backImg
				}
			],
			header: {
				Authorization: `Bearer ${token}`
			},
			formData: {
				certifyStr
			},
			success: (res) => resolve(JSON.parse(res.data)),
			fail: reject
		});
	});

	console.log('上传结果:', res);
	console.log('上传结果 code:', res.code);

	if (res.code === '200') {
		// 返回结构: { code, data: { data: { authStatus, ... }, message } }
		const authStatus = res.data?.data?.authStatus;
		const message = res.data?.message || '提交成功';
		showToast(message, 1500, authStatus == 3 ? 'success' : 'none');
		if (authStatus == 1 || authStatus == 3) {
			uni.setStorageSync("idCardNo", formData.idNo)
			setTimeout(
				() =>
					
					uni.reLaunch({
						url: '/pages/home/home'
					}),
				1500
			);
		}
	} else {
		showToast(res.data?.message || res.message || '提交失败');
	}
};
</script>

<style lang="scss" scoped>
.page-wrap {
	width: 100vw;
	min-height: 100vh;
	background: #f5f5f5;
	box-sizing: border-box;
	padding: 24rpx 32rpx 200rpx;
}

/* 表單卡片 */
.form-card {
	margin-bottom: 42rpx;
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	padding: 0 32rpx;
}

.form-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	min-height: 96rpx;
}

.form-row--arrow {
	justify-content: space-between;
}

.label {
	font-size: 28rpx;
	color: #333;
	width: 140rpx;
	flex-shrink: 0;
}

.input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	height: 96rpx;
	line-height: 96rpx;
}

.row-right {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.input-text {
	font-size: 28rpx;
	color: #c0c0c0;
}

.input-text--filled {
	color: #333;
}

.arrow {
	font-size: 40rpx;
	color: #bbb;
	margin-left: 8rpx;
	line-height: 1;
}

.divider {
	height: 1rpx;
	background: #f0f0f0;
}

/* 照片上傳 */
.upload-row {
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	padding: 32rpx 0 16rpx;
}

.upload-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.upload-placeholder {
	width: 100%;
	height: 200rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background: #f7f7f7;
	display: flex;
	align-items: center;
	justify-content: center;
}

.upload-placeholder-img {
	width: 100%;
	height: 200rpx;
	border-radius: 12rpx;
}

.upload-preview {
	width: 100%;
	height: 200rpx;
	border-radius: 12rpx;
}

.upload-label {
	font-size: 24rpx;
	color: #333;
	margin-top: 16rpx;
}

/* 溫馨提示 */
.tips-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	padding: 8rpx 0 32rpx;
}

.tips-text {
	font-size: 22rpx;
	color: #999;
	line-height: 1.6;
}

/* 底部提交 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background: #fff;
	padding: 24rpx 48rpx 48rpx;
	box-sizing: border-box;
}

.submit-btn {
	width: 100%;
	height: 92rpx;
	background: #cccccc;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 0.3s;
}

.submit-btn--active {
	background: #459767;
}

.submit-text {
	font-size: 32rpx;
	color: #fff;
}

/* 彈窗 */
.picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.4);
	z-index: 999;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.picker-panel {
	width: 100%;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: 48rpx;
}

.picker-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 48rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.picker-cancel {
	font-size: 28rpx;
	color: #999;
}

.picker-title {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.picker-confirm {
	font-size: 28rpx;
	color: #459767;
}

.picker-loading {
	height: 200rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.picker-loading-text {
	font-size: 28rpx;
	color: #999;
}

.picker-list {
	padding: 16rpx 0;
}

.picker-item {
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.picker-item-text {
	font-size: 28rpx;
	color: #999;
}

.picker-item-text--active {
	font-size: 36rpx;
	color: #333;
	font-weight: 600;
}
</style>
