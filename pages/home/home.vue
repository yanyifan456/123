<template>
	<view class="page">
		<view class="swiper-box">
			<swiper class="swiper" :autoplay="true" :interval="2500" :duration="700" :circular="true">
				<swiper-item v-for="item in swiperList" :key="item.id" @click="handleClickSwiper(item.path)">
					<view class="swiper-item">
						<image :src="item.url" class="img-box" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<view class="home-content-box">
			<view class="search-box" @click="handleClickSearch">
				<view class="search-main">
					<view class="search-icon">
						<image src="https://doctor.gzxinxingyiyuan.com/images/image/home/searchIcon1.png" mode="" class="img-box"></image>
					</view>
					<view class="search-text">搜尋醫生、科室、醫院、藥品</view>
				</view>
			</view>
			<view class="domain">
				<view class="domain-card" v-for="(item, index) in domainList" :style="{ backgroundImage: `url(${item.bgc})` }" @click="handleClickDomain(item.path)">
					<view class="domain-card-top">
						<view class="domain-card-title">
							{{ item.title }}
						</view>
						<view class="hot-sale" v-if="index == 1">热卖</view>
					</view>
					<view class="domain-card-subTitle">
						{{ item.subTitle }}
					</view>
					<view
						class="domain-card-btn"
						:class="{
							'domain-card-btn1': index === 0 || index === 2,
							'domain-card-btn2': index === 1 || index === 3
						}"
					>
						{{ item.actionText }}
					</view>
				</view>
			</view>
			<view class="main-box">
				<view class="main-card" v-for="item in mainList" @click="clickMainList(item)">
					<view class="main-pic">
						<image :src="item.name" mode="" class="img-box"></image>
					</view>
					<view class="main-title">{{ item.title }}</view>
				</view>
			</view>
			<view class="capsule-box">
				<swiper class="swiper" :autoplay="true" :interval="2500" :duration="700" :circular="true">
					<swiper-item v-for="item in swiperList1">
						<view class="swiper-item capsule-card">
							<view class="capsule-card-title">{{ item.title }}</view>
							<view class="capsule-card-desc">{{ item.desc }}</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
			<view class="appointment-box">
				<view class="appointment-box-title">我的預約</view>
				<view class="appointment-box-all">
					<view class="appointment-box-all-text">全部</view>
					<view class="appointment-box-all-icon">
						<uni-icons type="right" size="16" color="#a2a2a2"></uni-icons>
					</view>
				</view>
			</view>
			<view class="appointment-card">
				<view class="appointment-avator">
					<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/avaPicCicle.png" mode="" class="img-box"></image>
				</view>
				<view class="appointment-content">
					<view class="appointment-content-top">
						<view>
							<view>张三</view>
							<view>主任医生</view>
							<view></view>
						</view>
						<view>2026-02-06</view>
					</view>
					<view>全科医疗科</view>
				</view>
			</view>
			<view class="appointment-box">
				<view class="appointment-box-title">醫生推薦</view>
				<view class="appointment-box-all">
					<view class="appointment-box-all-text">全部</view>
					<view class="appointment-box-all-icon">
						<uni-icons type="right" size="16" color="#a2a2a2"></uni-icons>
					</view>
				</view>
			</view>
			<view class="doctor-box">
				<view class="doctor-card" v-for="i in 2">
					<view>
						<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/avaPicsquare1.png" mode="" class="img-box"></image>
						<view>
							<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/commendIconF.png" mode="" class="img-box"></image>
						</view>
					</view>
					<view>
						<view>
							<view>张三</view>
							<view>主任医师</view>
						</view>
						<view>全科医疗科</view>
						<view>顶级专家</view>
						<view>
							<view>
								<text style="font-size: 20rpx">￥</text>
								<text>49</text>
							</view>
							<view>预约费</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { getSystemInfo } from '@/utils/global.js';
import { onPullDownRefresh, onLoad, onShow } from '@dcloudio/uni-app';
import { updateTabbarBadge } from '@/utils/tabBarBadge.js';
import { jiaoyan ,getuser} from '@/api/yyf.js';
import { getMsgCount } from '@/api/base.js';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
// #ifdef APP-PLUS
try {
	const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
	console.log('TUICallKit:', TUICallKit);

	if (!TUICallKit) {
		throw new Error('插件未加载成功');
	}

	const userID = uni.getStorageSync('phone');
	console.log('userID:', userID);

	// 确保userID符合TUIKit要求（只能包含a-zA-Z0-9_-）
	const validUserID = String(userID).replace(/[^a-zA-Z0-9_-]/g, '');
	console.log('validUserID:', validUserID);

	const { userSig, sdkAppID } = genTestUserSig(validUserID);
	console.log('SDKAppID:', sdkAppID);
	console.log('userSig:', userSig ? '已生成' : '生成失败');

	uni.$TUICallKit = TUICallKit;

	// 👉 login
	try {
		uni.$TUICallKit.login({
			SDKAppID: sdkAppID,
			userID: validUserID,
			userSig,
			success: (res) => {
				console.log('✅ TUICallKit 登录成功:', res);

				// 登录成功后设置监听器
				setupTUICallKitListeners();
			},
			fail: (err) => {
				console.error('❌ TUICallKit 登录失败:', err);
				uni.showToast({
					title: '通话服务登录失败',
					icon: 'none'
				});
			}
		});
	} catch (e) {
		console.error('🔥 login 同步异常:', e);
	}

	// 👉 setSelfInfo
	try {
		uni.$TUICallKit.setSelfInfo({
			nickName: uni.getStorageSync('userName') || '患者',
			avatar: '',
			success: (res) => {
				console.log('✅ setSelfInfo 成功:', res);
			},
			fail: (err) => {
				console.error('❌ setSelfInfo 失败:', err);
			}
		});
	} catch (e) {
		console.error('🔥 setSelfInfo 同步异常:', e);
	}

	/**
	 * 设置TUICallKit事件监听器
	 * 用于监听来电、通话开始、通话结束等事件
	 */
	const setupTUICallKitListeners = () => {
		try {
			console.log('设置TUICallKit监听器...');

			// 监听收到来电
			uni.$TUICallKit.on('onInvited', (data) => {
				console.log('📞 收到来电邀请:', data);
				// TUIKit会自动显示接听界面
				// data包含: inviter(拨打者), inviteeList(接听者列表), groupId(群ID), type(通话类型)
			});

			// 监听通话开始
			uni.$TUICallKit.on('onCallBegin', (data) => {
				console.log('📹 通话开始:', data);
				// 可以在这里记录通话开始时间
			});

			// 监听通话结束
			uni.$TUICallKit.on('onCallEnd', (data) => {
				console.log('📹 通话结束:', data);
				// data包含: roomId, callType, totalTime等
			});

			// 监听错误
			uni.$TUICallKit.on('onError', (err) => {
				console.error('❌ TUICallKit 错误:', err);
			});

			console.log('✅ TUICallKit监听器设置完成');
		} catch (e) {
			console.error('🔥 设置监听器失败:', e);
		}
	};
} catch (err) {
	console.error('🚨 TUICallKit 初始化失败:', err);
	uni.showToast({
		title: '通话组件初始化失败',
		icon: 'none'
	});
}
// #endif

// 轮播图
const swiperList = reactive([
	{
		id: 1,
		name: 'swiper1',
		url: '/static/images/swiper1.png',
		path: false
	},
	{
		id: 2,
		name: 'swiper2',
		url: 'https://doctor.gzxinxingyiyuan.com/images/image/swiper/item3.png',
		path: '/pages/home/list/domainShop' // TODO:跳转商城
	}
]);

const handleClickSwiper = (v) => {
	v &&
		uni.navigateTo({
			url: v
		});
};
// 搜索
const handleClickSearch = () => {
	uni.navigateTo({
		url: '/pages/home/list/search'
	});
};

// 功能区
const domainList = reactive([
	{
		title: '求診醫療',
		subTitle: '環球港醫網全程為您服務',
		actionText: '去看病',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc1.png',
		path: '/pages/home/list/domainDoctor'
	},
	{
		title: '華興藥房',
		subTitle: '一键購藥 極速送達',
		actionText: '去買藥',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc2.png',
		path: '/pages/home/list/domainShop'
	},
	{
		title: '醫療諮詢',
		subTitle: 'AI諮詢 守護安康',
		actionText: '去諮詢',
		bgc: '/static/images/mainBgc3.png',
		path: '/pages/home/list/domainConsult'
	},
	{
		title: '我的指標',
		subTitle: '健康指標在綫查看',
		actionText: '去查看',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc4.png',
		path: '/pages/home/list/domainIndicator'
	}
]);
const handleClickDomain = async (url) => {
	console.log(url);

	const needAuthCheckPages = ['/pages/home/list/domainDoctor', '/pages/home/list/domainShop'];

	if (!needAuthCheckPages.includes(url)) {
		return uni.navigateTo({
			url
		});
	}

	const userId = uni.getStorageSync('userId');

	try {
		const res = await jiaoyan({ userId });

		console.log(res);

		if (res.code === '200') {
			// ❗未签署合同 -> 弹框确认后跳转个人中心
			if (res.data.signTag === '0') {
				uni.showModal({
					title: '提示',
					content: '未签署合同!',
					showCancel: false,
					confirmText: '确定',
					success: (result) => {
						if (result.confirm) {
							uni.reLaunch({
								url: '/pages/mine/mine'
							});
						}
					}
				});

				return;
			}

			// 已签署 -> 正常跳转
			uni.navigateTo({
				url
			});
		} else {
			uni.showToast({
				title: res.msg || '校验失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.showToast({
			title: '网络异常',
			icon: 'none'
		});
	}
};

// 检查用户信息是否完整
const checkUserInfoComplete = (userData) => {
	const requiredFields = ['userName', 'sex', 'birthyDay', 'height', 'weight', 'serialNumber', 'orgName'];
	for (const field of requiredFields) {
		if (!userData[field] || userData[field] === '' || userData[field] === null) {
			return false;
		}
	}
	return true;
};

// 首页初始化校验
const initPageCheck = async () => {
	const userId = uni.getStorageSync('userId');

	try {
		// 1. 先校验合同签署状态
		const jiaoyanRes = await jiaoyan({ userId });
		console.log('jiaoyan res:', jiaoyanRes);

		if (jiaoyanRes.code === '200') {
			// ❗未签署合同 -> 弹框确认后跳转个人中心
			if (jiaoyanRes.data.signTag === '0') {
				uni.showModal({
					title: '提示',
					content: '未签署合同!',
					showCancel: false,
					confirmText: '确定',
					success: (result) => {
						if (result.confirm) {
							uni.reLaunch({
								url: '/pages/mine/mine'
							});
						}
					}
				});

				return;
			}
		}

		// 2. 校验个人信息是否完整
		const userRes = await getuser({
			serialNumber: uni.getStorageSync('phone')
		});
		console.log('user res:', userRes);

		if (userRes.code === '200' && userRes.data && userRes.data.data) {
			const userData = userRes.data.data;
			const isComplete = checkUserInfoComplete(userData);

			if (!isComplete) {
				uni.showModal({
					title: '提示',
					content: '请完善个人信息!',
					showCancel: false,
					confirmText: '确定',
					success: (result) => {
						if (result.confirm) {
							uni.navigateTo({
								url: '/pages/mine/minelist/EditProfile'
							});
						}
					}
				});

				return;
			}
		}
	} catch (error) {
		console.error('initPageCheck error:', error);
	}
};

// 金刚区
const mainList = reactive([
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon3.png',
		title: '港醫講醫',
		path: '/pages/home/infomation/infomation'
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon1.png',
		title: '我的設備',
		path: '', // /pages/home/list/myDevice
		flag: 'navigate'
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon2.png',
		title: '我的親屬',
		path: false
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon4.png',
		title: '心裏診療',
		path: false,
		flag: 'webview'
	}
]);
const clickMainList = (val) => {
	val.path &&
		uni.navigateTo({
			url: val.path
		});

	if (val.flag == 'navigate') {
		plus.runtime.launchApplication(
			{
				pname: 'www.ruoguzhichuang.com'
			},
			() => {
				console.log('打开成功');
			},
			(err) => {
				console.log('打开失败', err);
			}
		);
	}
	if (val.flag == 'webview') {
		return;
		uni.navigateTo({
			url: '/pages/webview/webview?url=https://www.baidu.com'
		});
	}
};
// 胶囊区
const swiperList1 = ref([
	{
		title: '全面防癌基因檢查',
		desc: '為你摯愛買個最先進的防癌計劃'
	},
	{
		title: '馴化NK療法',
		desc: '增強免疫力，提升身體防禦機制'
	},
	{
		title: '糖尿病最新療法',
		desc: '前沿技術，改善糖尿病治療效果'
	},
	{
		title: '肝硬化及脂肪肝療法',
		desc: '最新方案，幫助肝臟健康修復'
	},
	{
		title: '玻璃肺結節清除療法',
		desc: '無創傷技術，輕鬆解決肺結節問題'
	}
]);

// 获取未读消息数量
const getCount = async () => {
	try {
		const res = await getMsgCount({
			telphone: uni.getStorageSync('phone')
		});
		console.log(res);
		updateTabbarBadge(1, res.data.countUnreadMsg || 0);
	} catch (error) {
		//TODO handle the exception
	} finally {
	}
};
onShow(() => {
	initPageCheck();
	setTimeout(() => {
		getCount();
	}, 1000);
	// 执行首页初始化校验
	
});
</script>

<style scoped lang="scss">
.swiper-box {
	width: 100%;
	height: 384rpx;
}

.swiper {
	width: 100%;
	height: 100%;
}

.swiper-item {
	width: 100%;
	height: 100%;
}

.home-content-box {
	width: 100%;
	min-height: 200rpx;
	background-color: $bg-page;
	border-radius: $radius-40 $radius-40 0 0;
	margin-top: -48rpx;
	padding: $space-32 $space-48;
	position: relative;
	z-index: 10;
}

.search-box {
	width: 100%;
	height: 100rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	border-radius: $radius-20;
	@include flex-center;
}

.search-main {
	@include flex-center;
}

.search-icon {
	width: 36rpx;
	height: 36rpx;
	margin-right: $space-8;
}

.search-text {
	color: $text-secondary;
	font-size: $font-28;
}

.domain {
	margin-top: $space-32;
	@include grid-col-2;
}

.domain-card {
	position: relative;
	width: 315rpx;
	height: 240rpx;
	background-color: #fff;
	background-size: 100% 100%;
	padding: $space-32;
	background-repeat: no-repeat;
	border-radius: $radius-20;
	box-shadow: $box-shadow;
}

.hot-sale {
	width: 64rpx;
	height: 34rpx;
	border-radius: $radius-10;
	background-color: $danger;
	font-size: $font-20;
	color: #fff;
	@include flex-center;
}

.domain-card-top {
	@include flex-between;
	color: $text-primary;
	font-size: $font-26;
	margin-bottom: $space-8;
}

.domain-card-title {
	color: $text-primary;
	font-size: $font-26;
	margin-bottom: $space-8;
}

.domain-card-subTitle {
	color: $text-secondary;
	font-size: $font-20;
}

.domain-card-btn {
	width: 120rpx;
	height: 52rpx;
	color: #fff;
	margin-top: $space-48;
	font-size: $font-26;
	border-radius: $radius-16;
	@include flex-center;
}

.domain-card-btn1 {
	background: linear-gradient(to right, $danger, $danger-secondary);
}

.domain-card-btn2 {
	background: linear-gradient(to right, $primary-light, $primary);
}

.main-box {
	width: 100%;
	height: 218rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-24;
	border-radius: $radius-20;
	padding: $space-16;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 48rpx;
}

.main-card {
	@include flex-col-center;
}

.main-pic {
	width: 98rpx;
	height: 98rpx;
}

.main-title {
	font-size: $font-28;
	color: $text-primary;
	margin-top: $space-16;
}

.capsule-box {
	width: 100%;
	height: 160rpx;
	margin-top: $space-32;
	background: url('https://doctor.gzxinxingyiyuan.com/images/image/capsule/item2.png') no-repeat;
	background-size: 100% 100%;
}

.capsule-card {
	color: #fff;
	position: relative;
	z-index: 11;
	@include flex-col-center;
}

.capsule-card-title {
	font-size: $font-26;
	@include flex-col-center;
}

.capsule-card-desc {
	margin-top: $space-16;
	font-size: $font-40;
	@include flex-col-center;
}

.appointment-box {
	height: 40rpx;
	margin-top: $space-32;
	font-size: $font-36;
	color: $text-primary;
	@include flex-between;
}

.appointment-box-all {
	@include flex-start;
}

.appointment-box-all-text {
	margin-right: $space-8;
	font-size: $font-24;
	color: $text-secondary;
}

.appointment-box-all-icon {
	width: 32rpx;
	height: 32rpx;
	@include flex-center;
}

.appointment-card {
	width: 100%;
	height: 202rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-between;
}

.appointment-avator {
	width: 116rpx;
	height: 116rpx;
	margin-right: $space-32;
	border-radius: 50%;
	border: 1px solid $primary;
}

.appointment-content {
	flex: 1;

	> :nth-child(2) {
		color: $text-secondary;
		font-size: $font-24;
	}
}

.appointment-content-top {
	margin-bottom: $space-20;
	@include flex-between;

	> :nth-child(1) {
		@include flex-between;

		> :nth-child(1) {
			color: $text-primary;
			font-size: $font-32;
			margin-right: $space-24;
		}

		> :nth-child(2) {
			color: $text-regular;
			font-size: $font-24;
			margin-right: $space-24;
		}
	}

	> :nth-child(2) {
		color: $text-secondary;
		font-size: $font-24;
	}
}

.doctor-card {
	width: 100%;
	height: 248rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-start;

	> :nth-child(1) {
		width: 184rpx;
		height: 184rpx;
		border-radius: $radius-20;
		margin-right: $space-32;
		position: relative;

		> :nth-child(2) {
			width: 50rpx;
			height: 56rpx;
			position: absolute;
			top: 0;
			left: 22rpx;
		}
	}

	> :nth-child(2) {
		flex: 1;
		position: relative;

		> :nth-child(1) {
			@include flex-start;

			> :nth-child(1) {
				color: $text-primary;
				font-size: $font-32;
				margin-right: $space-24;
			}

			> :nth-child(2) {
				color: $text-regular;
				font-size: $font-24;
			}
		}

		> :nth-child(2) {
			margin-top: $space-20;
			color: $text-secondary;
			font-size: $font-24;
		}

		> :nth-child(3) {
			width: fit-content;
			margin-top: $space-20;
			color: $primary;
			font-size: $font-24;
			padding: $space-8 $space-16;
			border: 1px solid $primary;
			border-radius: $radius-20;
		}

		> :nth-child(4) {
			@include flex-start-baseline;
			position: absolute;
			bottom: 0;
			right: 0;
			color: $primary;
			font-size: $font-24;

			> :nth-child(1) {
				margin-right: $space-8;
				font-size: $font-28;
				color: $danger;
			}

			> :nth-child(2) {
				font-size: $font-20;
				color: $text-regular;
			}
		}
	}
}
</style>
