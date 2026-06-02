<template>
	<view class="page">
		<image class="a" src="/static/img/1.png" mode=""></image>
		<view class="b">
			<view class="phone-input-wrap">
				<view class="country-code-btn" @click="showCountryPicker = true">
					<text class="country-code-text">{{ selectedCountry.countryCode }}</text>
					<uni-icons type="down" size="14"></uni-icons>
				</view>
				<view class="phone-divider"></view>
				<input class="phone-input" type="number" placeholder="輸入手機號" v-model="telPhone" />
			</view>
			<view class="" style="position: relative">
				<input class="c" type="number" placeholder="輸入驗證碼" v-model="verifyCode" />
				<text class="d" :class="{ 'd-disabled': countdown > 0 }" @click="getCode">{{ codeText }}</text>
			</view>
			<button class="e" :class="{ 'e-loading': loginLoading }" @click="gohome">
				<text v-if="!loginLoading">登錄</text>
				<view v-else class="loading-wrap">
					<view class="loading-spinner"></view>
					<text>登錄中...</text>
				</view>
			</button>
			<view class="h">
				<view class="i" :class="{ 'i-checked': isAgreed, 'i-disabled': loginLoading }" @click="toggleAgreed">
				</view>
				<view>
					<text class="f">
						我已閲讀並同意
						<text class="g" @click="gof">用户協議</text>
						和
						<text class="g" @click="goy">隱私政策</text>
					</text>
				</view>
			</view>
		</view>
		<!-- 区号选择弹窗 -->
		<view class="country-picker-mask" v-if="showCountryPicker" @click="showCountryPicker = false"></view>
		<view class="country-picker-popup" :class="{ 'country-picker-popup-show': showCountryPicker }">
			<view class="country-picker-header">
				<text class="country-picker-cancel" @click="showCountryPicker = false">取消</text>
				<text class="country-picker-title">選擇國際地區</text>
				<text class="country-picker-confirm" @click="confirmCountry">確認</text>
			</view>
			<scroll-view class="country-picker-list" scroll-y="true">
				<view class="country-picker-item"
					:class="{ 'country-picker-item-selected': tempSelectedCountry.id === item.id }"
					v-for="item in countryListData" :key="item.id" @click="tempSelectedCountry = item">
					<text>{{ item.countryCn }} | {{ item.countryEn }} | {{ item.countryCode }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		computed,
		onBeforeUnmount,
		onMounted
	} from "vue";
	import {
		login,
		code,
		countryList
	} from "@/api/yyf.js";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		BASE_URL
	} from '@/utils/setting.js'
	const telPhone = ref("");
	const verifyCode = ref("");
	const isAgreed = ref(false);
	const countdown = ref(0);
	const loginLoading = ref(false);
	let timer = null;

	// 切换协议勾选状态
	const toggleAgreed = () => {
		if (loginLoading.value) return;
		isAgreed.value = !isAgreed.value;
	};

	// 区号相关
	const showCountryPicker = ref(false);
	const countryListData = ref([]);
	const selectedCountry = ref({
		id: 1,
		countryCn: "中國大陸",
		countryCode: "+86",
		countryEn: "China",
	});
	const tempSelectedCountry = ref({
		id: 1,
		countryCn: "中國大陸",
		countryCode: "+86",
		countryEn: "China",
	});

	// 获取国家区号列表
	const getCountryList = async () => {
		try {
			const res = await countryList({});
			if (res.code === "200" && res.data && res.data.data) {
				countryListData.value = res.data.data;
				// 默认选择中国大陆
				const china = res.data.data.find((item) => item.countryCode === "+86");
				if (china) {
					selectedCountry.value = china;
					tempSelectedCountry.value = china;
				}
			}
		} catch (e) {
			console.error("获取国家列表失败", e);
		}
	};

	// 确认选择区号
	const confirmCountry = () => {
		selectedCountry.value = tempSelectedCountry.value;
		showCountryPicker.value = false;
	};

	// 页面加载时获取国家列表
	onMounted(() => {
		getCountryList();
		console.log(BASE_URL);
	});

	const codeText = computed(() => {
		return countdown.value > 0 ? `${countdown.value}s後重新獲取` : "獲取驗證碼";
	});
	// 开始倒计时
	const startCountdown = () => {
		countdown.value = 60;
		timer = setInterval(() => {
			countdown.value--;
			if (countdown.value <= 0) {
				clearInterval(timer);
				timer = null;
			}
		}, 1000);
	};
	// 获取验证码
	const getCode = async () => {
		console.log(1);
		if (countdown.value > 0) return;
		if (!telPhone.value) {
			uni.showToast({
				title: "請輸入手機號",
				icon: "none",
			});
			return;
		}
		try {
			const res = await code({
				telPhone: telPhone.value,
				countryCode: selectedCountry.value.countryCode,
			});
			console.log(res);
			if (res.code === "200") {
				if (res.data.code != null) {
					verifyCode.value = res.data.code
				} else {
					if (res.data.verify === "1") {
						uni.showToast({
							title: res.data.message,
							icon: "success",
						});
						startCountdown();
					} else {
						uni.showToast({
							title: res.data.message,
							icon: "none",
						});
					}
				}

			} else {
				uni.showToast({
					title: res.msg || "獲取驗證碼失敗",
					icon: "none",
				});
			}
		} catch (e) {
			uni.showToast({
				title: "網絡異常，請稍後重試",
				icon: "none",
			});
		}
	};
	// 登录
	const gohome = async () => {
		// uni.navigateTo({
		// 	url:'/pages/login/renzhen'
		// })
		// return
		if (loginLoading.value) return;
		if (!telPhone.value) {
			uni.showToast({
				title: "請輸入手機號",
				icon: "none",
			});
			return;
		}
		if (!verifyCode.value) {
			uni.showToast({
				title: "請輸入驗證碼",
				icon: "none",
			});
			return;
		}
		if (!isAgreed.value) {
			uni.showToast({
				title: "請先同意服務協議和隱私政策",
				icon: "none",
			});
			return;
		}
		loginLoading.value = true;
		try {
			const res = await login({
				telPhone: telPhone.value,
				code:verifyCode.value,
				countryCode: selectedCountry.value.countryCode,
			});

			if (res.code !== "200" || res.data.verify !== "1") {
				uni.showToast({
					title: (res.data && res.data.message) || res.msg || "登錄失敗",
					icon: "none",
				});
				return;
			}

			const {
				token,
				phone,
				authStatus,
				userId,
				countryCode,
				userName,
				idCardNo,
				signTag,
				consent
			} = res.data;
			console.log(res);
			
			// 统一存储
			uni.setStorageSync("token", token);
			uni.setStorageSync("phone", phone);
			uni.setStorageSync("userId", userId);
			uni.setStorageSync("userName", userName);
			uni.setStorageSync("countryCode", countryCode);
			uni.setStorageSync("idCardNo", idCardNo);
			uni.setStorageSync("signTag", signTag);
			uni.setStorageSync("consent", consent);
			console.log(idCardNo);
			// 通知 App.vue 初始化 TUICallKit（仅首次登录时有效）
			// #ifdef APP-PLUS
			uni.$emit('userLoggedIn');
			// #endif
			// 根据状态跳转
			switch (authStatus) {
				case 0:
					uni.navigateTo({
						url: "/pages/login/renzhen",
					});
					break;

				case 1:
					uni.setStorageSync("authStatus", authStatus);
					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/home/home",
						});
					}, 1500);
					break;

				default:
					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/home/home",
						});
					}, 1500);
					break;
			}
		} catch (err) {
			console.error(err);
			uni.showToast({
				title: "網絡異常，請稍後重試",
				icon: "none",
			});
		} finally {
			loginLoading.value = false;
		}
	};
	const gof = () => {
		uni.navigateTo({
			url: "/pages/login/yhxy",
		});
	};
	const goy = () => {
		uni.navigateTo({
			url: "/pages/login/yszc",
		});
	};
	// 组件卸载时清除定时器
	onBeforeUnmount(() => {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	});
	onLoad(() => {
		console.log(uni.getStorageSync("userId"));
		if (uni.getStorageSync("token")) {
			setTimeout(() => {
				uni.reLaunch({
					url: "/pages/home/home",
				});
			}, 500);
		} else {
			console.log(666);
		}
	});
</script>
<style lang="scss">
	.a {
		width: 100%;
		height: 710rpx;
	}

	.b {
		width: 100%;
		margin-top: -220rpx;
		height: calc(100% - 710rpx + 220rpx);
		background-color: #fff;
		z-index: 10;
		position: relative;
		border-radius: 40rpx 40rpx 0rpx 0rpx;
		padding: 64rpx 48rpx;
	}

	.c {
		height: 112rpx;
		background: #f8f8f8;
		border-radius: 56rpx 56rpx 56rpx 56rpx;
		padding-left: 24rpx;
		font-size: 28rpx;
		margin-bottom: 48rpx;
	}

	.d {
		position: absolute;
		right: 50rpx;
		top: 40rpx;
		font-size: 28rpx;
		color: #459767;
	}

	.d-disabled {
		color: #a2a2a2;
	}

	.e {
		height: 112rpx;
		background: #52ae7b;
		box-shadow:
			inset 0rpx 0rpx 12rpx 0rpx rgba(69, 151, 103, 0.4),
			0rpx 6rpx 12rpx 0rpx rgba(68, 68, 68, 0.0784);
		border-radius: 56rpx 56rpx 56rpx 56rpx;
		color: #fff;
		margin-top: 14rpx;
		line-height: 112rpx;
		font-size: 28rpx;
		margin-bottom: 52rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.e-loading {
		opacity: 0.7;
	}

	.loading-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-spinner {
		width: 32rpx;
		height: 32rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		margin-right: 12rpx;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.f {
		font-size: 24rpx;
		color: #a2a2a2;
	}

	.g {
		color: #52ae7b;
	}

	.h {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.i {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #d8d8d8;
		border-radius: 50%;
		margin-right: 16rpx;
	}

	.i-checked {
		background-color: #52ae7b;
		border-color: #52ae7b;
	}

	.i-disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* 手机号输入区域 */
	.phone-input-wrap {
		display: flex;
		align-items: center;
		height: 112rpx;
		background: #f8f8f8;
		border-radius: 56rpx;
		padding: 0 24rpx;
		margin-bottom: 48rpx;
	}

	.country-code-btn {
		display: flex;
		align-items: center;
		padding-right: 20rpx;
	}

	.country-code-text {
		font-size: 28rpx;
		color: #333;
	}

	.country-code-arrow {
		font-size: 20rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.phone-divider {
		width: 2rpx;
		height: 40rpx;
		background: #d8d8d8;
		margin-right: 20rpx;
	}

	.phone-input {
		flex: 1;
		height: 112rpx;
		font-size: 28rpx;
		background: transparent;
	}

	/* 区号选择弹窗 */
	.country-picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
	}

	.country-picker-popup {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 999;
		transform: translateY(100%);
		transition: transform 0.3s ease;
	}

	.country-picker-popup-show {
		transform: translateY(0);
	}

	.country-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 40rpx;
		border-bottom: 1rpx solid #eee;
	}

	.country-picker-cancel {
		font-size: 28rpx;
		color: #666;
	}

	.country-picker-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.country-picker-confirm {
		font-size: 28rpx;
		color: #52ae7b;
	}

	.country-picker-list {
		max-height: 600rpx;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.country-picker-item {
		padding: 32rpx 40rpx;
		font-size: 28rpx;
		color: #333;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.country-picker-item-selected {
		background: #f0f9f4;
		color: #52ae7b;
	}
</style>
